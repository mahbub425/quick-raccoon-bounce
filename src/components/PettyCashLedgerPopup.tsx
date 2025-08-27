import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES, DUMMY_USERS } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { PettyCashLedgerEntry } from "@/types";

interface PettyCashLedgerPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userPin: string;
}

const PettyCashLedgerPopup = ({ isOpen, onOpenChange, userPin }: PettyCashLedgerPopupProps) => {
  const { getPettyCashLedger, getPettyCashBalance } = useSubmittedVouchers();

  const userLedger = useMemo(() => {
    return getPettyCashLedger(userPin);
  }, [userPin, getPettyCashLedger]);

  const currentBalance = useMemo(() => {
    return getPettyCashBalance(userPin);
  }, [userPin, getPettyCashBalance]);

  const getBranchName = (branchId: string) => {
    const institution = DUMMY_INSTITUTIONS.find(inst => inst.branches.some(b => b.id === branchId));
    return institution?.branches.find(branch => branch.id === branchId)?.name || branchId;
  };

  const getPettyCashTypeLabel = (typeValue: string) => {
    const pettyCashVoucher = DUMMY_VOUCHER_TYPES.find(v => v.id === 'petty-cash-demand');
    const pettyCashTypeField = pettyCashVoucher?.formFields?.find(f => f.name === 'pettyCashType');
    return pettyCashTypeField?.options?.find(opt => opt.value === typeValue)?.label || typeValue;
  };

  const currentUser = DUMMY_USERS.find(u => u.pin === userPin);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-w-[95vw] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-2xl font-bold text-blue-700">
            পেটি ক্যাশ লেজার রিপোর্ট ({currentUser?.name} - {userPin})
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            এই ইউজারের সকল পেটি ক্যাশ লেনদেনের বিস্তারিত বিবরণ।
          </DialogDescription>
        </DialogHeader>

        {/* Balance Summary */}
        <div className={cn(
          "p-4 mb-4 rounded-lg shadow-sm border-2 text-center",
          currentBalance >= 0 ? "border-red-300 bg-red-50 text-red-700" : "border-green-300 bg-green-50 text-green-700"
        )}>
          <p className="text-xl font-extrabold">
            {currentBalance >= 0 ? (
              `আপনি প্রতিষ্ঠানকে ফেরত দিবেন: ${currentBalance.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            ) : (
              `আপনি প্রতিষ্ঠান হতে পাবেন: ${Math.abs(currentBalance).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            )}
          </p>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-100">
                <TableHead className="w-[50px]">ক্রমিক</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>উত্তলনের শাখা</TableHead>
                <TableHead>পেটিক্যাশ/ ভাউচারের ধরন</TableHead>
                <TableHead className="text-right">ডেবিট</TableHead> {/* Changed header */}
                <TableHead className="text-right">ক্রেডিট</TableHead> {/* Changed header */}
                <TableHead className="text-right">ব্যালেন্স</TableHead>
                <TableHead>বর্ণনা</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userLedger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    এই ইউজারের জন্য কোনো লেজার এন্ট্রি নেই।
                  </TableCell>
                </TableRow>
              ) : (
                userLedger.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{format(parseISO(entry.date), "dd MMM, yyyy")}</TableCell>
                    <TableCell>{getBranchName(entry.branch)}</TableCell>
                    <TableCell>{getPettyCashTypeLabel(entry.type)}</TableCell>
                    <TableCell className="text-right">{(entry.debit || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell> {/* Display debit */}
                    <TableCell className="text-right">{(entry.credit || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell> {/* Display credit */}
                    <TableCell className="text-right">
                      <span className={cn(
                        entry.balance >= 0 ? "text-red-700" : "text-green-700"
                      )}>
                        {entry.balance.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-blue-50 font-bold">
                <TableCell colSpan={6}>মোট ব্যালেন্স</TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    currentBalance >= 0 ? "text-red-700" : "text-green-700"
                  )}>
                    {currentBalance.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PettyCashLedgerPopup;