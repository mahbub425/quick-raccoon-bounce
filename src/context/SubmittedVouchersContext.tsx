import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from "react";
import { CartItem, SubmittedVoucher, VoucherStatus, PettyCashLedgerEntry } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { generatePettyCashVoucherNumber, createWithdrawalLedgerEntry, createAdjustmentLedgerEntry, createReversalLedgerEntry } from "@/utils/pettyCashUtils"; // Import new function
import { format, parseISO } from "date-fns";

interface SubmittedVouchersContextType {
  submittedVouchers: SubmittedVoucher[];
  addSubmittedVouchers: (items: Omit<CartItem, 'id' | 'createdAt'>[]) => SubmittedVoucher[]; // Added return type
  updateSubmittedVoucherStatus: (voucherId: string, status: VoucherStatus, comment?: string) => void;
  updateSubmittedVoucherData: (voucherId: string, newData: any) => void;
  markVoucherAsCorrected: (voucherId: string) => void;
  clearSubmittedVouchers: () => void;
  updatePettyCashApproval: (voucherId: string, approvedAmount: number, expectedAdjustmentDate: Date) => void; // New
  updatePettyCashCode: (voucherId: string, code: string) => void; // New
  addPettyCashLedgerEntry: (entry: PettyCashLedgerEntry) => void; // New
  getPettyCashLedger: (userPin: string) => PettyCashLedgerEntry[]; // New
  getPettyCashBalance: (userPin: string) => number; // New
}

const SubmittedVouchersContext = createContext<SubmittedVouchersContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "submittedVouchers";
const LOCAL_STORAGE_LEDGER_KEY_PREFIX = "pettyCashLedger_"; // Prefix for user-specific ledgers

export const SubmittedVouchersProvider = ({ children }: { children: ReactNode }) => {
  const [submittedVouchers, setSubmittedVouchers] = useState<SubmittedVoucher[]>(() => {
    // Load initial state from localStorage
    if (typeof window !== "undefined") {
      const savedVouchers = localStorage.getItem(LOCAL_STORAGE_KEY);
      try {
        return savedVouchers ? JSON.parse(savedVouchers) : [];
      } catch (e) {
        console.error("Failed to parse submitted vouchers from localStorage", e);
        return [];
      }
    }
    return [];
  });
  const { user } = useAuth();

  // State to hold all petty cash ledgers, keyed by userPin
  const [allPettyCashLedgers, setAllPettyCashLedgers] = useState<{ [userPin: string]: PettyCashLedgerEntry[] }>(() => {
    if (typeof window !== "undefined") {
      const ledgers: { [userPin: string]: PettyCashLedgerEntry[] } = {};
      // Iterate through all localStorage keys to find ledgers
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LOCAL_STORAGE_LEDGER_KEY_PREFIX)) {
          const userPin = key.replace(LOCAL_STORAGE_LEDGER_KEY_PREFIX, '');
          try {
            ledgers[userPin] = JSON.parse(localStorage.getItem(key) || '[]');
          } catch (e) {
            console.error(`Failed to parse ledger for ${userPin} from localStorage`, e);
          }
        }
      }
      return ledgers;
    }
    return {};
  });

  // Save submittedVouchers to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(submittedVouchers));
    }
  }, [submittedVouchers]);

  // Save individual ledgers to localStorage whenever allPettyCashLedgers changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      Object.keys(allPettyCashLedgers).forEach(userPin => {
        localStorage.setItem(`${LOCAL_STORAGE_LEDGER_KEY_PREFIX}${userPin}`, JSON.stringify(allPettyCashLedgers[userPin]));
      });
    }
  }, [allPettyCashLedgers]);

  const addSubmittedVouchers = (items: Omit<CartItem, 'id' | 'createdAt'>[]): SubmittedVoucher[] => { // Added return type
    if (!user) {
      toast.error("ভাউচার সাবমিট করার জন্য লগইন করুন।");
      return []; // Return empty array if no user
    }

    const newSubmittedItems: SubmittedVoucher[] = items.map(item => {
      const isPettyCashDemand = item.voucherTypeId === 'petty-cash-demand';
      return {
        id: Date.now().toString(), // Generate new ID
        createdAt: new Date().toISOString(), // Generate new timestamp
        ...item, // Spread the rest of the item properties
        status: 'pending',
        submittedByPin: user.pin,
        submittedByName: user.name,
        submittedByMobile: user.mobileNumber,
        submittedByDepartment: user.department,
        submittedByDesignation: user.designation,
        submittedByRole: user.role,
        voucherNumber: isPettyCashDemand ? generatePettyCashVoucherNumber() : (item.voucherNumber || Date.now().toString().slice(-6)), // Generate 4-digit for petty cash, else 6-digit
        originalVoucherId: item.originalVoucherId,
        correctionCount: item.correctionCount || 0,
        approvedAmount: isPettyCashDemand ? undefined : item.data.amount, // Only set for non-petty-cash initially
        expectedAdjustmentDate: undefined,
        pettyCashUniqueCode: undefined,
        isCodeGenerated: false,
      };
    });
    setSubmittedVouchers((prev) => [...prev, ...newSubmittedItems]);
    return newSubmittedItems; // Return the newly added items
  };

  const updateSubmittedVoucherStatus = (voucherId: string, status: VoucherStatus, comment?: string) => {
    setSubmittedVouchers((prev) =>
      prev.map((voucher) => {
        if (voucher.id === voucherId) {
          // Check if it's a non-petty-cash voucher being sent back or rejected
          // And ensure it's not already in that state to prevent duplicate ledger entries
          if (
            voucher.voucherTypeId !== 'petty-cash-demand' &&
            (status === 'sent_back' || status === 'rejected') &&
            (voucher.status !== 'sent_back' && voucher.status !== 'rejected') // Only add ledger entry if status is changing to sent_back/rejected for the first time
          ) {
            addPettyCashLedgerEntry(createReversalLedgerEntry(voucher, status));
          }
          return { ...voucher, status, comment };
        }
        return voucher;
      }),
    );
  };

  const updateSubmittedVoucherData = (voucherId: string, newData: any) => {
    setSubmittedVouchers((prev) =>
      prev.map((voucher) =>
        voucher.id === voucherId ? { ...voucher, data: newData, createdAt: new Date().toISOString() } : voucher,
      ),
    );
  };

  const markVoucherAsCorrected = (voucherId: string) => {
    setSubmittedVouchers((prev) =>
      prev.map((voucher) =>
        voucher.id === voucherId ? { ...voucher, status: 'corrected_by_user' } : voucher,
      ),
    );
  };

  const updatePettyCashApproval = (voucherId: string, approvedAmount: number, expectedAdjustmentDate: Date) => {
    setSubmittedVouchers((prev) =>
      prev.map((voucher) =>
        voucher.id === voucherId
          ? {
              ...voucher,
              approvedAmount,
              expectedAdjustmentDate: expectedAdjustmentDate.toISOString(),
              status: 'approved', // Mark as approved by mentor
            }
          : voucher,
      ),
    );
  };

  const updatePettyCashCode = (voucherId: string, code: string) => {
    setSubmittedVouchers((prev) =>
      prev.map((voucher) =>
        voucher.id === voucherId
          ? {
              ...voucher,
              pettyCashUniqueCode: code,
              isCodeGenerated: true,
            }
          : voucher,
      ),
    );
  };

  const addPettyCashLedgerEntry = (entry: PettyCashLedgerEntry) => {
    const userPin = entry.userPin; // Use userPin directly from the entry

    if (!userPin) {
      console.error("User PIN is missing for ledger entry.");
      return;
    }

    setAllPettyCashLedgers(prevLedgers => {
      const currentLedger = prevLedgers[userPin] || [];
      const newLedger = [...currentLedger, entry];
      
      // Recalculate balances for all entries in the new ledger
      let runningBalance = 0;
      const updatedLedger = newLedger.map(item => {
        runningBalance += item.debit - item.credit; // Balance = Previous Balance + Debit - Credit
        return { ...item, balance: runningBalance };
      });

      return {
        ...prevLedgers,
        [userPin]: updatedLedger,
      };
    });
  };

  const getPettyCashLedger = (userPin: string): PettyCashLedgerEntry[] => {
    return allPettyCashLedgers[userPin] || [];
  };

  const getPettyCashBalance = (userPin: string): number => {
    const ledger = getPettyCashLedger(userPin);
    if (ledger.length === 0) return 0;
    return ledger[ledger.length - 1].balance; // Return the last calculated balance
  };

  const clearSubmittedVouchers = () => {
    setSubmittedVouchers([]);
  };

  return (
    <SubmittedVouchersContext.Provider
      value={{
        submittedVouchers,
        addSubmittedVouchers,
        updateSubmittedVoucherStatus,
        updateSubmittedVoucherData,
        markVoucherAsCorrected,
        clearSubmittedVouchers,
        updatePettyCashApproval,
        updatePettyCashCode,
        addPettyCashLedgerEntry,
        getPettyCashLedger,
        getPettyCashBalance,
      }}
    >
      {children}
    </SubmittedVouchersContext.Provider>
  );
};

export const useSubmittedVouchers = () => {
  const context = useContext(SubmittedVouchersContext);
  if (context === undefined) {
    throw new Error("useSubmittedVouchers must be used within a SubmittedVouchersProvider");
  }
  return context;
};