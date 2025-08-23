import React, { createContext, useState, useContext, ReactNode } from "react";
import { CartItem } from "@/types";

interface SubmittedVouchersContextType {
  submittedVouchers: CartItem[];
  addSubmittedVouchers: (items: CartItem[]) => void;
  clearSubmittedVouchers: () => void;
}

const SubmittedVouchersContext = createContext<SubmittedVouchersContextType | undefined>(undefined);

export const SubmittedVouchersProvider = ({ children }: { children: ReactNode }) => {
  const [submittedVouchers, setSubmittedVouchers] = useState<CartItem[]>([]);

  const addSubmittedVouchers = (items: CartItem[]) => {
    setSubmittedVouchers((prev) => [...prev, ...items]);
  };

  const clearSubmittedVouchers = () => {
    setSubmittedVouchers([]);
  };

  return (
    <SubmittedVouchersContext.Provider
      value={{
        submittedVouchers,
        addSubmittedVouchers,
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