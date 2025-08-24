import React, { useMemo } from "react";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Payment = () => {
  const { submittedVouchers, updateSubmittedVoucherStatus } = useSubmittedVouchers();
  const navigate = useNavigate();

  // Filter for vouchers that are 'approved' by a mentor
  const approvedVouchersForPayment = useMemo(() => {
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

  const handleMarkAsPaid = (voucherId: string) => {
    updateSubmittedVoucherStatus(voucherId, 'paid'); // Assuming 'paid' is a new status for payment
    toast.success(`ভাউচার ${voucherId} সফলভাবে পেমেন্ট করা হয়েছে!`);
  };

  const totalVouchers = approvedVouchersForPayment.length;
  const grandTotalAmount = approvedVouchersForPayment.reduce((sum, voucher) => sum + (voucher.data.amount || 0), 0);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-teal-800 mb-8">
        পেমেন্ট
      </h1>

      {approvedVouchersForPayment.length === 0 ? (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          কোনো ভাউচার পেমেন্টের জন্য অপেক্ষমাণ নেই।
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-teal-200 max-w-7xl mx-auto">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-teal-100">
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
                {approvedVouchersForPayment.map((voucher, index) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{voucher.voucherNumber}</TableCell>
                    <TableCell>{format(parseISO(voucher.createdAt), "dd MMM, yyyy")}</TableCell>
                    <TableCell>{voucher.submittedByName} ({voucher.submittedByPin})</TableCell>
                    <TableCell>{getInstitutionName(voucher.data.institutionId)}</TableCell>
                    <TableCell>{getBranchName(voucher.data.institutionId, voucher.data.branchId)}</TableCell>
                    <TableCell>{getVoucherHeadingById(voucher.voucherTypeId)}</TableCell>
                    <TableCell className="text-right">{(voucher.data.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700 text-white" 
                        onClick={() => handleMarkAsPaid(voucher.id)}
                      >
                        পেমেন্ট সম্পন্ন করুন
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-teal-50 font-bold">
                  <TableCell colSpan={7}>মোট</TableCell>
                  <TableCell className="text-right">{grandTotalAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;