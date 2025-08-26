import React, { useMemo, useState } from "react";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SubmittedVoucher } from "@/types";
import VoucherDetailsPopup from "@/components/VoucherDetailsPopup"; // Import the popup component
import PaymentCodeVerificationPopup from "@/components/PaymentCodeVerificationPopup"; // Import new component
import { createWithdrawalLedgerEntry } from "@/utils/pettyCashUtils"; // Import utility for ledger entry

type PaymentViewFilter = 'all' | 'petty_cash' | 'other_vouchers';

const Payment = () => {
  const { submittedVouchers, updateSubmittedVoucherStatus, addPettyCashLedgerEntry } = useSubmittedVouchers();
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedVoucherForPopup, setSelectedVoucherForPopup] = useState<SubmittedVoucher | null>(null);
  const [currentFilter, setCurrentFilter] = useState<PaymentViewFilter>('all'); // New state for filter

  const [isCodeVerificationPopupOpen, setIsCodeVerificationPopupOpen] = useState(false); // State for code verification popup
  const [voucherToProcess, setVoucherToProcess] = useState<SubmittedVoucher | null>(null); // Voucher awaiting code verification

  // Filter for vouchers that are 'pending' or 'approved'
  const vouchersForPaymentView = useMemo(() => {
    const approvedOrPending = submittedVouchers.filter(v => v.status === 'pending' || v.status === 'approved');

    if (currentFilter === 'petty_cash') {
      return approvedOrPending.filter(v => v.voucherTypeId === 'petty-cash-demand');
    } else if (currentFilter === 'other_vouchers') {
      return approvedOrPending.filter(v => v.voucherTypeId !== 'petty-cash-demand');
    }
    return approvedOrPending;
  }, [submittedVouchers, currentFilter]);

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
    const voucherToPay = vouchersForPaymentView.find(v => v.id === voucherId);
    if (!voucherToPay) return;

    if (voucherToPay.status !== 'approved') {
      toast.error("এই ভাউচারটি এখনো অনুমোদিত হয়নি।");
      return;
    }

    if (voucherToPay.voucherTypeId === 'petty-cash-demand') {
      setVoucherToProcess(voucherToPay);
      setIsCodeVerificationPopupOpen(true);
    } else {
      // For non-petty-cash vouchers, proceed directly
      updateSubmittedVoucherStatus(voucherId, 'paid');
      toast.success(`ভাউচার ${voucherToPay.voucherNumber} সফলভাবে পেমেন্ট করা হয়েছে!`);
    }
  };

  const handleVerifyCodeAndPay = (inputCode: string) => {
    if (!voucherToProcess) return;

    if (voucherToProcess.pettyCashUniqueCode === inputCode) {
      updateSubmittedVoucherStatus(voucherToProcess.id, 'paid');
      toast.success(`পেটি ক্যাশ চাহিদাপত্র ${voucherToProcess.voucherNumber} সফলভাবে পেমেন্ট করা হয়েছে!`);
      addPettyCashLedgerEntry(createWithdrawalLedgerEntry(voucherToProcess)); // Add to ledger
      setIsCodeVerificationPopupOpen(false);
      setVoucherToProcess(null);
    } else {
      toast.error("আপনি ভুল কোড প্রবেশ করিয়েছেন। পেমেন্ট সম্পন্ন হয়নি।");
    }
  };

  const handleViewVoucherDetails = (voucher: SubmittedVoucher) => {
    setSelectedVoucherForPopup(voucher);
    setIsPopupOpen(true);
  };

  const totalVouchers = vouchersForPaymentView.length;
  const grandTotalAmount = vouchersForPaymentView.reduce((sum, voucher) => sum + (voucher.voucherTypeId === 'petty-cash-demand' ? (voucher.approvedAmount || 0) : (voucher.data.amount || 0)), 0);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-teal-800 mb-8">
        পেমেন্ট
      </h1>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={currentFilter === 'petty_cash' ? "default" : "outline"}
          className={currentFilter === 'petty_cash' ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-white text-teal-700 border-teal-400 hover:bg-teal-100 hover:text-teal-800"}
          onClick={() => setCurrentFilter('petty_cash')}
        >
          অনুমোদন প্রাপ্ত পেটিক্যাশের ভাউচার সমূহ
        </Button>
        <Button
          variant={currentFilter === 'other_vouchers' ? "default" : "outline"}
          className={currentFilter === 'other_vouchers' ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-white text-teal-700 border-teal-400 hover:bg-teal-100 hover:text-teal-800"}
          onClick={() => setCurrentFilter('other_vouchers')}
        >
          অনুমোদন প্রাপ্ত ভাউচার সমূহ
        </Button>
        {/* Optionally, an "All" button */}
        <Button
          variant={currentFilter === 'all' ? "default" : "outline"}
          className={currentFilter === 'all' ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-white text-teal-700 border-teal-400 hover:bg-teal-100 hover:text-teal-800"}
          onClick={() => setCurrentFilter('all')}
        >
          সকল ভাউচার
        </Button>
      </div>

      {vouchersForPaymentView.length === 0 ? (
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
                  <TableHead>স্ট্যাটাস</TableHead> {/* Added Status column */}
                  <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                  <TableHead className="text-center">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchersForPaymentView.map((voucher, index) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{voucher.voucherNumber}</TableCell>
                    <TableCell>{format(parseISO(voucher.createdAt), "dd MMM, yyyy")}</TableCell>
                    <TableCell>{voucher.submittedByName} ({voucher.submittedByPin})</TableCell>
                    <TableCell>{getInstitutionName(voucher.data.institutionId)}</TableCell>
                    <TableCell>{getBranchName(voucher.data.institutionId, voucher.data.branchId)}</TableCell>
                    <TableCell>{getVoucherHeadingById(voucher.voucherTypeId)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        voucher.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        voucher.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {voucher.status === 'pending' ? 'অপেক্ষমাণ' :
                         voucher.status === 'approved' ? 'অনুমোদিত' :
                         'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(voucher.voucherTypeId === 'petty-cash-demand' ? (voucher.approvedAmount || 0) : (voucher.data.amount || 0)).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-center flex justify-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewVoucherDetails(voucher)}
                      >
                        দেখুন
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700 text-white" 
                        onClick={() => handleMarkAsPaid(voucher.id)}
                        disabled={voucher.status !== 'approved'} // Disable if not approved
                      >
                        পেমেন্ট সম্পন্ন করুন
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-teal-50 font-bold">
                  <TableCell colSpan={8}>মোট</TableCell> {/* Adjusted colspan */}
                  <TableCell className="text-right">{grandTotalAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
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
          isPaymentView={true} // Pass the new prop here
        />
      )}

      {isCodeVerificationPopupOpen && (
        <PaymentCodeVerificationPopup
          isOpen={isCodeVerificationPopupOpen}
          onOpenChange={setIsCodeVerificationPopupOpen}
          onVerify={handleVerifyCodeAndPay}
        />
      )}
    </div>
  );
};

export default Payment;