import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const MentorApproval = () => {
  const { submittedVouchers } = useSubmittedVouchers();
  const navigate = useNavigate();

  // Filter states
  // const [startDate, setStartDate] = useState<Date | undefined>(undefined); // Removed
  // const [endDate, setEndDate] = useState<Date | undefined>(undefined); // Removed
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>("all");
  const [pinSearchTerm, setPinSearchTerm] = useState<string>("");
  // const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("all"); // Removed
  // const [selectedBranchId, setSelectedBranchId] = useState<string>("all"); // Removed

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

  // const institutionOptions = DUMMY_INSTITUTIONS.map(inst => ({ value: inst.id, label: inst.name })); // Removed
  // const branchOptions = [{ value: "bogura", label: "Bogura (বগুড়া)" }]; // Removed

  // Filtered and grouped data
  const filteredAndGroupedVouchers = useMemo(() => {
    const filteredVouchers = submittedVouchers.filter(voucher => {
      // Filter by date range (Removed)
      // const voucherDate = parseISO(voucher.createdAt);
      // if (startDate && endDate) {
      //   const adjustedEndDate = endOfDay(endDate);
      //   if (!isWithinInterval(voucherDate, { start: startDate, end: adjustedEndDate })) {
      //     return false;
      //   }
      // } else if (startDate && !endDate) {
      //   if (voucherDate < startDate) return false;
      // } else if (!startDate && endDate) {
      //   const adjustedEndDate = endOfDay(endDate);
      //   if (voucherDate > adjustedEndDate) return false;
      // }


      // Filter by voucher type
      if (selectedVoucherType !== "all" && voucher.voucherTypeId !== selectedVoucherType) {
        return false;
      }

      // Filter by PIN
      if (pinSearchTerm && !voucher.submittedByPin.includes(pinSearchTerm)) {
        return false;
      }

      // Filter by institution (Removed)
      // if (selectedInstitutionId !== "all" && voucher.data.institutionId !== selectedInstitutionId) {
      //   return false;
      // }

      // Filter by branch (Removed)
      // if (selectedBranchId !== "all" && voucher.data.branchId !== selectedBranchId) {
      //   return false;
      // }

      // Only show pending vouchers in the main table
      return voucher.status === 'pending';
    });

    // Group by user (submittedByPin)
    const groupedByUser: {
      [pin: string]: {
        user: { pin: string; name: string; mobileNumber: string; department: string; designation: string; };
        pendingCount: number;
        totalAmount: number;
      };
    } = {};

    filteredVouchers.forEach(voucher => {
      if (!groupedByUser[voucher.submittedByPin]) {
        groupedByUser[voucher.submittedByPin] = {
          user: {
            pin: voucher.submittedByPin,
            name: voucher.submittedByName,
            mobileNumber: voucher.submittedByMobile,
            department: voucher.submittedByDepartment,
            designation: voucher.submittedByDesignation,
          },
          pendingCount: 0,
          totalAmount: 0,
        };
      }
      groupedByUser[voucher.submittedByPin].pendingCount += 1;
      groupedByUser[voucher.submittedByPin].totalAmount += (voucher.data.amount || 0);
    });

    return Object.values(groupedByUser);
  }, [submittedVouchers, selectedVoucherType, pinSearchTerm]); // Removed startDate, endDate, selectedInstitutionId, selectedBranchId from dependencies

  const totalPendingVouchers = useMemo(() => filteredAndGroupedVouchers.reduce((sum, user) => sum + user.pendingCount, 0), [filteredAndGroupedVouchers]);
  const grandTotalAmount = useMemo(() => filteredAndGroupedVouchers.reduce((sum, user) => sum + user.totalAmount, 0), [filteredAndGroupedVouchers]);

  const handleViewUserVouchers = (userPin: string) => {
    navigate(`/mentor-approval/${userPin}`, {
      state: {
        filters: {
          // startDate: startDate?.toISOString(), // Removed
          // endDate: endDate?.toISOString(), // Removed
          selectedVoucherType,
          pinSearchTerm, // This will be the userPin for the details page
          // selectedInstitutionId, // Removed
          // selectedBranchId, // Removed
        }
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-8">
        মেন্টর অ্যাপ্রুভাল
      </h1>

      {/* Filter Section */}
      <Card className="mb-8 p-6 shadow-lg border-purple-300 bg-white">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Start Date (Removed) */}
          {/* <div className="flex flex-col space-y-1">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">শুরু তারিখ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM, yyyy") : <span>তারিখ নির্বাচন করুন</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  toDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div> */}

          {/* End Date (Removed) */}
          {/* <div className="flex flex-col space-y-1">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">শেষ তারিখ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd MMM, yyyy") : <span>তারিখ নির্বাচন করুন</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  toDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div> */}

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

          {/* PIN Search */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="pinSearch" className="text-sm font-medium text-gray-700">পিন লিখুন</label>
            <Input
              id="pinSearch"
              placeholder="পিন দিয়ে সার্চ করুন"
              value={pinSearchTerm}
              onChange={(e) => setPinSearchTerm(e.target.value)}
            />
          </div>

          {/* Institution Select (Removed) */}
          {/* <div className="flex flex-col space-y-1">
            <label htmlFor="institutionSelect" className="text-sm font-medium text-gray-700">প্রতিষ্ঠান নির্বাচন করুন</label>
            <Select value={selectedInstitutionId} onValueChange={setSelectedInstitutionId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="সকল প্রতিষ্ঠান" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল প্রতিষ্ঠান</SelectItem>
                {institutionOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {/* Branch Select (Removed) */}
          {/* <div className="flex flex-col space-y-1">
            <label htmlFor="branchSelect" className="text-sm font-medium text-gray-700">শাখা নির্বাচন করুন</label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="সকল শাখা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল শাখা</SelectItem>
                {branchOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </CardContent>
      </Card>

      {/* Main Table Section */}
      {filteredAndGroupedVouchers.length === 0 ? (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          কোনো ভাউচার অ্যাপ্রুভালের জন্য অপেক্ষমাণ নেই।
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-100">
                  <TableHead className="w-[50px]">ক্রমিক</TableHead>
                  <TableHead>পিন</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>মোবাইল নম্বর</TableHead>
                  <TableHead>অনুমোদন বাকি আছে</TableHead>
                  <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                  <TableHead className="text-center">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndGroupedVouchers.map((userGroup, index) => (
                  <TableRow key={userGroup.user.pin}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{userGroup.user.pin}</TableCell>
                    <TableCell>{userGroup.user.name}</TableCell>
                    <TableCell>{userGroup.user.mobileNumber}</TableCell>
                    <TableCell>{userGroup.pendingCount}</TableCell>
                    <TableCell className="text-right">{userGroup.totalAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewUserVouchers(userGroup.user.pin)}>
                        দেখুন
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-purple-50 font-bold">
                  <TableCell colSpan={4}>মোট</TableCell>
                  <TableCell>{totalPendingVouchers}</TableCell>
                  <TableCell className="text-right">{grandTotalAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell>
                  <TableCell></TableCell> {/* Empty cell for action column */}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorApproval;