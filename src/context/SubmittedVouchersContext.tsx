import React, { createContext, useState, useContext, ReactNode } from "react";
import { CartItem, SubmittedVoucher, VoucherStatus } from "@/types";
import { useAuth } from "./AuthContext"; // Import useAuth to get current user info
import { toast } from "sonner";

interface SubmittedVouchersContextType {
  submittedVouchers: SubmittedVoucher[];
  addSubmittedVouchers: (items: CartItem[]) => void;
  updateSubmittedVoucherStatus: (voucherId: string, status: VoucherStatus, comment?: string) => void;
  clearSubmittedVouchers: () => void;
}

const SubmittedVouchersContext = createContext<SubmittedVouchersContextType | undefined>(undefined);

export const SubmittedVouchersProvider = ({ children }: { children: ReactNode }) => {
  const [submittedVouchers, setSubmittedVouchers] = useState<SubmittedVoucher[]>([]);
  const { user } = useAuth(); // Get current user from AuthContext

  const addSubmittedVouchers = (items: CartItem[]) => {
    if (!user) {
      toast.error("ভাউচার সাবমিট করার জন্য লগইন করুন।");
      return;
    }

    const newSubmittedItems: SubmittedVoucher[] = items.map(item => ({
      ...item,
      status: 'pending', // Default status
      submittedByPin: user.pin,
      submittedByName: user.name,
      submittedByMobile: user.mobileNumber,
      submittedByDepartment: user.department,
      submittedByDesignation: user.designation,
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

  const clearSubmittedVouchers = () => {
    setSubmittedVouchers([]);
  };

  return (
    <SubmittedVouchersContext.Provider
      value={{
        submittedVouchers,
        addSubmittedVouchers,
        updateSubmittedVoucherStatus,
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