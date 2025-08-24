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

  const [selectedVoucherType, setSelectedVoucherType] = useState<string>("all");
  const [pinSearchTerm, setPinSearchTerm] = useState<string>("");

  const voucherTypeOptions = useMemo(() => {
    const uniqueTypes = new Set<string>();
    DUMMY_VOUCHER_TYPES.forEach(vt => {
      if (vt.type === 'single') {
        uniqueTypes.add(vt.id);
      } else if (vt.subTypes) {
        vt.subTypes.forEach(subType => uniqueTypes.add(subType.id));
      }
    });

    uniqueTypes.delete('publicity');

    return Array.from(uniqueTypes).map(id => {
      const voucher = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
      return { value: id, label: voucher?.heading || id };
    });
  }, []);

  const filteredAndGroupedVouchers = useMemo(() => {
    console.log("All submitted vouchers (from context):", submittedVouchers); // Debug log 1

    const filteredVouchers = submittedVouchers.filter(voucher => {
      // Only show pending vouchers in the main table
      if (voucher.status !== 'pending') {
        return false;
      }

      // Filter by voucher type
      if (selectedVoucherType !== "all" && voucher.voucherTypeId !== selectedVoucherType) {
        return false;
      }

      // Filter by PIN
      if (pinSearchTerm && !voucher.submittedByPin.includes(pinSearchTerm)) {
        return false;
      }

      return true;
    });

    console.log("Filtered vouchers (status=pending, by type/pin):", filteredVouchers); // Debug log 2

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

    console.log("Grouped by user before Object.values:", groupedByUser); // Debug log 3

    return Object.values(groupedByUser);
  }, [submittedVouchers, selectedVoucherType, pinSearchTerm]);

  const totalPendingVouchers = useMemo(() => filteredAndGroupedVouchers.reduce((sum, user) => sum + user.pendingCount, 0), [filteredAndGroupedVouchers]);
  const grandTotalAmount = useMemo(() => filteredAndGroupedVouchers.reduce((sum, user) => sum + user.totalAmount, 0), [filteredAndGroupedVouchers]);

  const handleViewUserVouchers = (userPin: string) => {
    navigate(`/mentor-approval/${userPin}`, {
      state: {
        filters: {
          selectedVoucherType,
          pinSearchTerm: userPin, // This will be the userPin for the details page
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

export default MentorApproval;