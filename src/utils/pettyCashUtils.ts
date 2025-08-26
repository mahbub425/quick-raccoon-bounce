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
    return acc + entry.withdrawalAmount - entry.adjustmentAmount;
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

// Function to create a ledger entry from a paid petty cash demand voucher
export const createWithdrawalLedgerEntry = (voucher: SubmittedVoucher): PettyCashLedgerEntry => {
  return {
    date: format(parseISO(voucher.createdAt), "yyyy-MM-dd"),
    branch: voucher.data.branchId, // Assuming branchId is stored in data
    type: voucher.data.pettyCashType,
    withdrawalAmount: voucher.approvedAmount || 0,
    adjustmentAmount: 0,
    balance: 0, // Will be calculated by the ledger logic
    description: `পেটি ক্যাশ উত্তোলন: ${voucher.voucherNumber}`,
  };
};

// Function to create a ledger entry from a submitted non-petty-cash voucher (for adjustment)
export const createAdjustmentLedgerEntry = (voucher: SubmittedVoucher): PettyCashLedgerEntry => {
  return {
    date: format(parseISO(voucher.createdAt), "yyyy-MM-dd"),
    branch: voucher.data.branchId, // Assuming branchId is stored in data
    type: voucher.voucherHeading, // Use voucher heading as type for adjustment
    withdrawalAmount: 0,
    adjustmentAmount: voucher.data.amount || 0,
    balance: 0, // Will be calculated by the ledger logic
    description: `ভাউচার সমন্বয়: ${voucher.voucherNumber}`,
  };
};