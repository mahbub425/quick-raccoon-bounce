import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { CartItem, SubmittedVoucher, VoucherStatus } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface SubmittedVouchersContextType {
  submittedVouchers: SubmittedVoucher[];
  addSubmittedVouchers: (items: Omit<CartItem, 'id' | 'createdAt'>[]) => void;
  updateSubmittedVoucherStatus: (voucherId: string, status: VoucherStatus, comment?: string) => void;
  updateSubmittedVoucherData: (voucherId: string, newData: any) => void;
  markVoucherAsCorrected: (voucherId: string) => void; // New function
  clearSubmittedVouchers: () => void;
}

const SubmittedVouchersContext = createContext<SubmittedVouchersContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "submittedVouchers";

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

  // Save submittedVouchers to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(submittedVouchers));
    }
  }, [submittedVouchers]);

  const addSubmittedVouchers = (items: Omit<CartItem, 'id' | 'createdAt'>[]) => {
    if (!user) {
      toast.error("ভাউচার সাবমিট করার জন্য লগইন করুন।");
      return;
    }

    const newSubmittedItems: SubmittedVoucher[] = items.map(item => ({
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
      originalVoucherId: item.originalVoucherId, // Pass originalVoucherId if present
      correctionCount: item.correctionCount || 0, // Pass correctionCount if present, otherwise 0
    }));
    setSubmittedVouchers((prev) => [...prev, ...newSubmittedItems]);
  };

  const updateSubmittedVoucherStatus = (voucherId: string, status: VoucherStatus, comment?: string) => {
    setSubmittedVouchers((prev) =>
      prev.map((voucher) =>
        voucher.id === voucherId ? { ...voucher, status, comment } : voucher,
      ),
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