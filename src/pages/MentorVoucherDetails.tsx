import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, isWithinInterval, parseISO, endOfDay } from "date-fns";
import { DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { SubmittedVoucher } from "@/types";
import VoucherDetailsPopup from "@/components/VoucherDetailsPopup";

// Helper function to get correction text
const getCorrectionText = (count: number | undefined) => {
  if (count === undefined || count === 0) { // Original submission, or no correction count
    return ''; // No text for original submission
  } else if (count === 1) {
    return 'সংশোধিত';
  } else { // count > 1
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const toBengaliNumber = (num: number) => {
      return String(num).split('').map(digit => bengaliNumbers[parseInt(digit)]).join('');
    };
    return `${toBengaliNumber(count)}য় বার সংশোধিত`;
  }
};

const MentorVoucherDetails = () => {
  const { userPin } = useParams<{ userPin: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { submittedVouchers } = useSubmittedVouchers();

  // Filter states, initialized from location state or defaults
  const initialFilters = location.state?.filters || {};
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>(initialFilters.selectedVoucherType || "all");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedVoucherForPopup, setSelectedVoucherForPopup] = useState<SubmittedVoucher | null>(null);

  // Options for dropdowns
  const voucherTypeOptions = useMemo(() => {
    const uniqueTypes = new Set<string>();
    DUMMY_VOUCHER_TYPES.forEach(vt => {
      if (vt.type === 'single') {
        uniqueTypes.add(vt.id);
      } else if (vt.subTypes) {
        vt.subTypes.forEach(subType => uniqueTypes.add(subType.id));
      }
    });

    // Explicitly remove 'publicity' if it was added, as its sub-types are now listed separately
    uniqueTypes.delete('publicity');

    return Array.from(uniqueTypes).map(id => {
      const voucher = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
      return { value: id, label: voucher?.heading || id };
    });
  }, []);

  // Get the user details for the current userPin
  const currentUser = useMemo(() => {
    const userVouchers = submittedVouchers.filter(v => v.submittedByPin === userPin);
    if (userVouchers.length > 0) {
      const firstVoucher = userVouchers[0];
      return {
        pin: firstVoucher.submittedByPin,
        name: firstVoucher.submittedByName,
        mobileNumber: firstVoucher.submittedByMobile,
        department: firstVoucher.submittedByDepartment,
        designation: firstVoucher.submittedByDesignation,
      };
    }
    return null;
  }, [submittedVouchers, userPin]);

  // Filtered vouchers for the specific user
  const filteredUserVouchers = useMemo(() => {
    return submittedVouchers.filter(voucher => {
      // Filter by user PIN
      if (voucher.submittedByPin !== userPin) {
        return false;
      }

      // Only show pending vouchers and filter out 'corrected_by_user'
      if (voucher.status !== 'pending') {
        return false;
      }

      // Filter by voucher type
      if (selectedVoucherType !== "all" && voucher.voucherTypeId !== selectedVoucherType) {
        return false;
      }

      return true;
    });
  }, [submittedVouchers, userPin, selectedVoucherType]);

  const totalAmountForUserVouchers = useMemo(() => filteredUserVouchers.reduce((sum, voucher) => sum + (voucher.data.amount || 0), 0), [filteredUserVouchers]);

  const getVoucherHeadingById = (id: string) => {
    const voucher = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
    return voucher?.heading || id;
  };

  const handleViewVoucherDetails = (voucher: SubmittedVoucher) => {
    setSelectedVoucherForPopup(voucher);
    setIsPopupOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 p-6">
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          এই পিনের জন্য কোনো ব্যবহারকারী বা ভাউচার পাওয়া যায়নি।
          <div className="mt-6">
            <Button onClick={() => navigate("/mentor-approval")} className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-2 px-6 rounded-md shadow-md">
              মেন্টর অ্যাপ্রুভালে ফিরে যান
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-8">
        মেন্টর অ্যাপ্রুভাল
      </h1>

      {/* Filter Section */}
      <Card className="mb-8 p-6 shadow-lg border-purple-300 bg-white">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Voucher Type */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="voucherType" className="text-sm font-medium text-gray-700">ভাউচারের ধরন নির্বাচন করুন</label>
            <Select value={selectedVoucherType} onValueChange={setSelectedVoucherType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="সকল ভাউচার টাইপ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল ভাউচার টাইপ</SelectItem>
                {voucherTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Details Section */}
      <Card className="mb-8 p-6 shadow-lg border-blue-300 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-blue-700">ভাউচার জমাদানকারীর তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 space-y-2">
          <p className="text-lg"><strong>নাম:</strong> {currentUser.name} (PIN: {currentUser.pin})</p>
          <p><strong>ডিপার্টমেন্ট:</strong> {currentUser.department}</p>
          <p><strong>পদবী:</strong> {currentUser.designation}</p>
          <p><strong>মোবাইল নম্বর:</strong> {currentUser.mobileNumber}</p>
        </CardContent>
      </Card>

      {/* User's Vouchers Table */}
      {filteredUserVouchers.length === 0 ? (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          এই ব্যবহারকারীর জন্য কোনো অপেক্ষমাণ ভাউচার নেই।
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-[50px]">ক্রমিক</TableHead>
                  <TableHead>ভাউচার নাম্বার</TableHead> {/* Added Voucher Number */}
                  <TableHead>জমাদানের তারিখ</TableHead>
                  <TableHead>শাখার নাম</TableHead>
                  <TableHead>ভাউচারের ধরন</TableHead>
                  <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                  <TableHead className="text-center">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUserVouchers.map((voucher, index) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {voucher.voucherNumber}
                      {voucher.originalVoucherId && (
                        <span className="ml-2 text-sm text-purple-600">
                          ({getCorrectionText(voucher.correctionCount)})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{format(parseISO(voucher.createdAt), "dd MMM, yyyy")}</TableCell>
                    <TableCell>{DUMMY_INSTITUTIONS.find(inst => inst.id === voucher.data.institutionId)?.branches.find(b => b.id === voucher.data.branchId)?.name || "N/A"}</TableCell>
                    <TableCell>{getVoucherHeadingById(voucher.voucherTypeId)}</TableCell>
                    <TableCell className="text-right">{(voucher.data.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewVoucherDetails(voucher)}>
                        দেখুন
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-blue-50 font-bold">
                  <TableCell colSpan={5}>মোট</TableCell> {/* Adjusted colSpan from 4 to 5 */}
                  <TableCell className="text-right">{totalAmountForUserVouchers.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                  <TableCell></TableCell> {/* Empty cell for action column */}
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

export default MentorVoucherDetails;