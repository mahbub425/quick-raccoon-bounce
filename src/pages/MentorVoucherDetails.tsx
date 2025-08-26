import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { generateUniquePettyCashCode } from "@/utils/pettyCashUtils"; // Import utility for code generation

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
  const { submittedVouchers, updatePettyCashApproval, getPettyCashLedger, getPettyCashBalance } = useSubmittedVouchers();

  // Filter states, initialized from location state or defaults
  const initialFilters = location.state?.filters || {};
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>(initialFilters.selectedVoucherType || "all");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedVoucherForPopup, setSelectedVoucherForPopup] = useState<SubmittedVoucher | null>(null);

  // State for editing petty cash approval
  const [editingPettyCashId, setEditingPettyCashId] = useState<string | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<number | null>(null);
  const [expectedAdjustmentDate, setExpectedAdjustmentDate] = useState<Date | null>(null);

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

  const totalAmountForUserVouchers = useMemo(() => filteredUserVouchers.reduce((sum, voucher) => sum + (voucher.data.amount || voucher.data.requestedAmount || 0), 0), [filteredUserVouchers]);

  const getVoucherHeadingById = (id: string) => {
    const voucher = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
    return voucher?.heading || id;
  };

  const getInstitutionName = (id: string) => DUMMY_INSTITUTIONS.find(inst => inst.id === id)?.name || "N/A";
  const getBranchName = (institutionId: string, branchId: string) => {
    const institution = DUMMY_INSTITUTIONS.find(inst => inst.id === institutionId);
    return institution?.branches.find(branch => branch.id === branchId)?.name || "N/A";
  };
  const getPettyCashTypeLabel = (typeValue: string) => {
    const pettyCashVoucher = DUMMY_VOUCHER_TYPES.find(v => v.id === 'petty-cash-demand');
    const pettyCashTypeField = pettyCashVoucher?.formFields?.find(f => f.name === 'pettyCashType');
    return pettyCashTypeField?.options?.find(opt => opt.value === typeValue)?.label || typeValue;
  };

  const handleViewVoucherDetails = (voucher: SubmittedVoucher) => {
    setSelectedVoucherForPopup(voucher);
    setIsPopupOpen(true);
  };

  const handleEditPettyCashApproval = (voucher: SubmittedVoucher) => {
    setEditingPettyCashId(voucher.id);
    setApprovedAmount(voucher.approvedAmount || voucher.data.requestedAmount || null);
    setExpectedAdjustmentDate(voucher.expectedAdjustmentDate ? parseISO(voucher.expectedAdjustmentDate) : null);
  };

  const handleSavePettyCashApproval = (voucherId: string) => {
    if (approvedAmount === null || approvedAmount <= 0) {
      toast.error("অনুমোদিত টাকার পরিমাণ অবশ্যই 0 এর বেশি হতে হবে।");
      return;
    }
    if (expectedAdjustmentDate === null) {
      toast.error("সম্ভাব্য সমন্বয়ের তারিখ আবশ্যক।");
      return;
    }

    updatePettyCashApproval(voucherId, approvedAmount, expectedAdjustmentDate);
    toast.success("পেটি ক্যাশ অনুমোদন সফলভাবে আপডেট করা হয়েছে!");
    setEditingPettyCashId(null); // Exit edit mode
    setApprovedAmount(null);
    setExpectedAdjustmentDate(null);
  };

  const handleCancelEdit = () => {
    setEditingPettyCashId(null);
    setApprovedAmount(null);
    setExpectedAdjustmentDate(null);
  };

  const userPettyCashBalance = useMemo(() => {
    if (!userPin) return 0;
    return getPettyCashBalance(userPin);
  }, [userPin, getPettyCashBalance, submittedVouchers]); // Re-calculate when submittedVouchers change

  const pettyCashLedgerLink = `/report?userPin=${userPin}&reportType=pettyCashLedger`;

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

      {/* User Details Section (Split for Petty Cash Demand) */}
      {selectedVoucherType === 'petty-cash-demand' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Section: Petty Cash Demand Submitter Info */}
          <Card className="p-6 shadow-lg border-blue-300 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-blue-700">পেটিক্যাশ চাহিদাপত্র জমাদানকারীর তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-2">
              <p className="text-lg"><strong>নাম:</strong> {currentUser.name} (PIN: {currentUser.pin})</p>
              <p><strong>ডিপার্টমেন্ট:</strong> {currentUser.department}</p>
              <p><strong>পদবী:</strong> {currentUser.designation}</p>
              <p><strong>মোবাইল নম্বর:</strong> {currentUser.mobileNumber}</p>
            </CardContent>
          </Card>

          {/* Right Section: Balance Card */}
          <Card className={cn(
            "p-6 shadow-lg border-2",
            userPettyCashBalance >= 0 ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
          )}>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-700">ব্যালেন্স</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {userPettyCashBalance >= 0 ? (
                <p className="text-3xl font-extrabold text-red-700">
                  আপনি প্রতিষ্ঠানকে ফেরত দিবেন: {userPettyCashBalance.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              ) : (
                <p className="text-3xl font-extrabold text-green-700">
                  আপনি প্রতিষ্ঠান হতে পাবেন: {Math.abs(userPettyCashBalance).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              )}
              <div className="mt-4">
                <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0" onClick={() => navigate(pettyCashLedgerLink)}>
                  পূর্ববর্তী পেটিক্যাশের ব্যালেন্স
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
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
      )}

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
                  <TableHead>ভাউচার নাম্বার</TableHead>
                  {selectedVoucherType === 'petty-cash-demand' ? (
                    <TableHead>কত তারিখে প্রয়োজন</TableHead> // Renamed
                  ) : (
                    <TableHead>জমাদানের তারিখ</TableHead>
                  )}
                  {selectedVoucherType === 'petty-cash-demand' ? (
                    <TableHead>প্রদেয় শাখা</TableHead> // Renamed
                  ) : (
                    <TableHead>শাখার নাম</TableHead>
                  )}
                  {selectedVoucherType !== 'petty-cash-demand' && ( // Removed for petty cash
                    <TableHead>ভাউচারের ধরন</TableHead>
                  )}
                  {selectedVoucherType === 'petty-cash-demand' && (
                    <>
                      <TableHead>পেটি ক্যাশের ধরন</TableHead>
                      <TableHead>বর্ণনা</TableHead>
                      <TableHead className="text-right">চাহিদাকৃত টাকার পরিমান</TableHead>
                      <TableHead className="text-right">অনুমোদিত টাকার পরিমান</TableHead>
                      <TableHead>সম্ভাব্য সমন্বয়ের তারিখ</TableHead>
                    </>
                  )}
                  {selectedVoucherType !== 'petty-cash-demand' && (
                    <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                  )}
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
                    {/* Conditional Date Cell */}
                    {selectedVoucherType === 'petty-cash-demand' ? (
                      <TableCell>{voucher.data.dateNeeded ? format(new Date(voucher.data.dateNeeded), "dd MMM, yyyy") : "N/A"}</TableCell> // Use dateNeeded
                    ) : (
                      <TableCell>{format(parseISO(voucher.createdAt), "dd MMM, yyyy")}</TableCell>
                    )}
                    {/* Conditional Branch Name Cell */}
                    <TableCell>{getBranchName(voucher.data.institutionId, voucher.data.branchId)}</TableCell>
                    {/* Conditional Voucher Type Cell */}
                    {selectedVoucherType !== 'petty-cash-demand' && (
                      <TableCell>{getVoucherHeadingById(voucher.voucherTypeId)}</TableCell>
                    )}
                    {/* Petty Cash Specific Cells */}
                    {selectedVoucherType === 'petty-cash-demand' && (
                      <>
                        <TableCell>{getPettyCashTypeLabel(voucher.data.pettyCashType)}</TableCell>
                        <TableCell>{voucher.data.description || "N/A"}</TableCell>
                        <TableCell className="text-right">{(voucher.data.requestedAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">
                          {editingPettyCashId === voucher.id ? (
                            <Input
                              type="number"
                              value={approvedAmount === null ? "" : approvedAmount}
                              onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || null)}
                              className="w-24 text-right"
                            />
                          ) : (
                            (voucher.approvedAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPettyCashId === voucher.id ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[140px] justify-start text-left font-normal",
                                    !expectedAdjustmentDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {expectedAdjustmentDate ? format(expectedAdjustmentDate, "dd MMM, yyyy") : <span>তারিখ নির্বাচন করুন</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={expectedAdjustmentDate}
                                  onSelect={setExpectedAdjustmentDate}
                                  initialFocus
                                  fromDate={new Date()} // Only current and future dates
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            voucher.expectedAdjustmentDate ? format(parseISO(voucher.expectedAdjustmentDate), "dd MMM, yyyy") : "N/A"
                          )}
                        </TableCell>
                      </>
                    )}
                    {selectedVoucherType !== 'petty-cash-demand' && (
                      <TableCell className="text-right">{(voucher.data.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                    )}
                    <TableCell className="text-center flex justify-center space-x-2">
                      {voucher.voucherTypeId === 'petty-cash-demand' && editingPettyCashId === voucher.id ? (
                        <>
                          <Button variant="default" size="sm" onClick={() => handleSavePettyCashApproval(voucher.id)}>
                            অনুমোদিত {/* Changed from সেভ to অনুমোদিত */}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            বাতিল
                          </Button>
                        </>
                      ) : (
                        <>
                          {voucher.voucherTypeId !== 'petty-cash-demand' && ( // Conditionally render "দেখুন"
                            <Button variant="outline" size="sm" onClick={() => handleViewVoucherDetails(voucher)}>
                              দেখুন
                            </Button>
                          )}
                          {/* The "এডিট" button for petty-cash-demand is already conditional */}
                          {voucher.voucherTypeId === 'petty-cash-demand' && (
                            <Button variant="secondary" size="sm" onClick={() => handleEditPettyCashApproval(voucher)}>
                              এডিট
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-blue-50 font-bold">
                  {selectedVoucherType === 'petty-cash-demand' ? (
                    <>
                      <TableCell colSpan={6}>মোট</TableCell> {/* Spans up to 'বর্ণনা' */}
                      <TableCell className="text-right">{(filteredUserVouchers.reduce((sum, v) => sum + (v.data.requestedAmount || 0), 0)).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right">{(filteredUserVouchers.reduce((sum, v) => sum + (v.approvedAmount || 0), 0)).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                      <TableCell colSpan={2}></TableCell> {/* Empty for date and action */}
                    </>
                  ) : (
                    <>
                      <TableCell colSpan={5}>মোট</TableCell> {/* Spans up to 'ভাউচারের ধরন' */}
                      <TableCell className="text-right">{totalAmountForUserVouchers.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                      <TableCell></TableCell> {/* Empty cell for action column */}
                    </>
                  )}
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