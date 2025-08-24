import React, { useMemo, useState } from "react";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { SubmittedVoucher } from "@/types";
import VoucherDetailsPopup from "@/components/VoucherDetailsPopup"; // Assuming this popup is reusable for viewing details
import { toast } from "sonner"; // Added toast import

const FinalCheckApproval = () => {
  const { submittedVouchers, updateSubmittedVoucherStatus } = useSubmittedVouchers();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedVoucherForPopup, setSelectedVoucherForPopup] = useState<SubmittedVoucher | null>(null);

  // Filter for vouchers that are 'approved' by a mentor and are ready for final check
  const vouchersForFinalApproval = useMemo(() => {
    // Filter out 'corrected_by_user' status from the main list
    return submittedVouchers.filter(v => v.status === 'approved');
  }, [submittedVouchers]);

  const getVoucherHeadingById = (id: string) => {
    const voucherType = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
    return voucherType?.heading || id;
  };

  const getInstitutionName = (id: string) => DUMMY_INSTITUTIONS.find(inst => inst.id === id)?.name || "N/A";
  const getBranchName = (institutionId: string, branchId: string) => {
    const institution = DUMMY_INSTITUTIONS.find(inst => inst.id === institutionId);
    return institution?.branches.find(branch => branch.id === branchId)?.name || "N/A";
  };

  const handleViewVoucherDetails = (voucher: SubmittedVoucher) => {
    setSelectedVoucherForPopup(voucher);
    setIsPopupOpen(true);
  };

  const handleFinalApprove = (voucherId: string) => {
    updateSubmittedVoucherStatus(voucherId, 'paid'); // Assuming 'paid' is the final status after final approval
    console.log(`Voucher ${voucherId} finally approved and marked as paid.`);
    toast.success("ভাউচার সফলভাবে ফাইনাল অ্যাপ্রুভ করা হয়েছে এবং পেমেন্টের জন্য প্রস্তুত!");
  };

  const totalVouchers = vouchersForFinalApproval.length;
  const grandTotalAmount = vouchersForFinalApproval.reduce((sum, voucher) => sum + (voucher.data.amount || 0), 0);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-orange-700 mb-8">
        ফাইনাল চেক ও অ্যাপ্রুভাল
      </h1>

      {vouchersForFinalApproval.length === 0 ? (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          কোনো ভাউচার ফাইনাল অ্যাপ্রুভালের জন্য অপেক্ষমাণ নেই।
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200 max-w-7xl mx-auto">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-100">
                  <TableHead className="w-[50px]">ক্রমিক</TableHead>
                  <TableHead>ভাউচার নাম্বার</TableHead>
                  <TableHead>জমাদানের তারিখ</TableHead>
                  <TableHead>জমাদানকারী</TableHead>
                  <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                  <TableHead>শাখার নাম</TableHead>
                  <TableHead>ভাউচারের ধরন</TableHead>
                  <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                  <TableHead className="text-center">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchersForFinalApproval.map((voucher, index) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {voucher.voucherNumber}
                      {voucher.originalVoucherId && (
                        <span className="ml-2 text-sm text-purple-600">(সংশোধিত)</span>
                      )}
                    </TableCell>
                    <TableCell>{format(parseISO(voucher.createdAt), "dd MMM, yyyy")}</TableCell>
                    <TableCell>{voucher.submittedByName} ({voucher.submittedByPin})</TableCell>
                    <TableCell>{getInstitutionName(voucher.data.institutionId)}</TableCell>
                    <TableCell>{getBranchName(voucher.data.institutionId, voucher.data.branchId)}</TableCell>
                    <TableCell>{getVoucherHeadingById(voucher.voucherTypeId)}</TableCell>
                    <TableCell className="text-right">{(voucher.data.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell>
                    <TableCell className="text-center flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewVoucherDetails(voucher)}>
                        দেখুন
                      </Button>
                      <Button variant="default" size="sm" className="ml-2 bg-green-600 hover:bg-green-700" onClick={() => handleFinalApprove(voucher.id)}>
                        ফাইনাল অ্যাপ্রুভ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-orange-50 font-bold">
                  <TableCell colSpan={7}>মোট</TableCell>
                  <TableCell className="text-right">{grandTotalAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}

      {selectedVoucherForPopup && (
        <VoucherDetailsPopup
          isOpen={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          voucher={selectedVoucherForPopup}
        />
      )}
    </div>
  );
};

export default FinalCheckApproval;