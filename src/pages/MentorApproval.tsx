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

// Helper function to get voucher heading by ID (copied from other files for consistency)
const getVoucherHeadingById = (id: string) => {
  const voucherType = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
  return voucherType?.heading || id;
};

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
    const filteredVouchers = submittedVouchers.filter(voucher => {
      if (voucher.status !== 'pending') {
        return false;
      }
      if (selectedVoucherType !== "all" && voucher.voucherTypeId !== selectedVoucherType) {
        return false;
      }
      if (pinSearchTerm && !voucher.submittedByPin.includes(pinSearchTerm)) {
        return false;
      }
      return true;
    });

    // Group by user (submittedByPin) AND voucherTypeId
    const groupedByPinAndType: {
      [key: string]: {
        user: { pin: string; name: string; mobileNumber: string; department: string; designation: string; };
        voucherTypeId: string;
        voucherTypeHeading: string;
        pendingCount: number;
        totalAmount: number;
      };
    } = {};

    filteredVouchers.forEach(voucher => {
      const key = `${voucher.submittedByPin}_${voucher.voucherTypeId}`;
      if (!groupedByPinAndType[key]) {
        groupedByPinAndType[key] = {
          user: {
            pin: voucher.submittedByPin,
            name: voucher.submittedByName,
            mobileNumber: voucher.submittedByMobile,
            department: voucher.submittedByDepartment,
            designation: voucher.submittedByDesignation,
          },
          voucherTypeId: voucher.voucherTypeId,
          voucherTypeHeading: getVoucherHeadingById(voucher.voucherTypeId),
          pendingCount: 0,
          totalAmount: 0,
        };
      }
      groupedByPinAndType[key].pendingCount += 1;
      groupedByPinAndType[key].totalAmount += (voucher.data.amount || 0);
    });

    return Object.values(groupedByPinAndType);
  }, [submittedVouchers, selectedVoucherType, pinSearchTerm]);

  const totalPendingVouchers = useMemo(() => filteredAndGroupedVouchers.reduce((sum, group) => sum + group.pendingCount, 0), [filteredAndGroupedVouchers]);
  const grandTotalAmount = useMemo(() => filteredAndGroupedVouchers.reduce((sum, group) => sum + group.totalAmount, 0), [filteredAndGroupedVouchers]);

  const handleViewUserVouchers = (userPin: string, voucherTypeId: string) => {
    navigate(`/mentor-approval/${userPin}`, {
      state: {
        filters: {
          selectedVoucherType: voucherTypeId, // Pass the specific voucher type
          pinSearchTerm: userPin,
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
                  <TableHead>ভাউচারের ধরন</TableHead> {/* New column */}
                  <TableHead>অনুমোদন বাকি আছে</TableHead>
                  <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                  <TableHead className="text-center">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndGroupedVouchers.map((userGroup, index) => (
                  <TableRow key={`${userGroup.user.pin}-${userGroup.voucherTypeId}`}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{userGroup.user.pin}</TableCell>
                    <TableCell>{userGroup.user.name}</TableCell>
                    <TableCell>{userGroup.voucherTypeHeading}</TableCell> {/* Display voucher type heading */}
                    <TableCell>{userGroup.pendingCount}</TableCell>
                    <TableCell className="text-right">{userGroup.totalAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewUserVouchers(userGroup.user.pin, userGroup.voucherTypeId)}>
                        দেখুন
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-purple-50 font-bold">
                  <TableCell colSpan={4}>মোট</TableCell>{/* Adjusted colSpan from 3 to 4 */}
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