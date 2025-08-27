import { PettyCashLedgerEntry, SubmittedVoucher } from "@/types";
import { format, parseISO } from "date-fns";

// Function to generate a 4-digit alphanumeric unique code
export const generateUniquePettyCashCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function to calculate the running balance for a user's petty cash ledger
export const calculatePettyCashBalance = (ledger: PettyCashLedgerEntry[]): number => {
  return ledger.reduce((acc, entry) => {
    return acc + entry.debit - entry.credit; // Balance = Previous Balance + Debit - Credit
  }, 0);
};

// Function to generate a 4-digit alphanumeric unique voucher number
export const generatePettyCashVoucherNumber = (): string => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function to create a ledger entry from a paid petty cash demand voucher (Withdrawal)
export const createWithdrawalLedgerEntry = (voucher: SubmittedVoucher): PettyCashLedgerEntry => {
  return {
    userPin: voucher.submittedByPin,
    date: format(parseISO(voucher.createdAt), "yyyy-MM-dd"),
    branch: voucher.data.branchId,
    type: voucher.data.pettyCashType,
    debit: voucher.approvedAmount || 0, // Withdrawal is a debit to user's account
    credit: 0,
    balance: 0, // Will be calculated by the ledger logic
    description: `পেটি ক্যাশ উত্তোলন: ${voucher.voucherNumber}`,
  };
};

// Function to create a ledger entry from a submitted non-petty-cash voucher (Adjustment/Expense)
export const createAdjustmentLedgerEntry = (voucher: SubmittedVoucher): PettyCashLedgerEntry => {
  return {
    userPin: voucher.submittedByPin,
    date: format(parseISO(voucher.createdAt), "yyyy-MM-dd"),
    branch: voucher.data.branchId,
    type: voucher.voucherHeading,
    debit: 0,
    credit: voucher.data.amount || 0, // Submitting a voucher is a credit to user's account
    balance: 0, // Will be calculated by the ledger logic
    description: `ভাউচার সমন্বয়: ${voucher.voucherNumber}`,
  };
};

// Function to create a ledger entry for a rejected/sent-back voucher (Reversing a previous adjustment)
export const createReversalLedgerEntry = (voucher: SubmittedVoucher, status: 'sent_back' | 'rejected'): PettyCashLedgerEntry => {
  const description = status === 'sent_back'
    ? `ভাউচার ফেরত পাঠানো হয়েছে: ${voucher.voucherNumber}`
    : `ভাউচার বাতিল করা হয়েছে: ${voucher.voucherNumber}`;

  return {
    userPin: voucher.submittedByPin,
    date: format(new Date(), "yyyy-MM-dd"), // Use current date for reversal entry
    branch: voucher.data.branchId,
    type: voucher.voucherHeading,
    debit: voucher.data.amount || 0, // Reversing a credit is a debit
    credit: 0,
    balance: 0, // Will be calculated by the ledger logic
    description: description,
  };
};