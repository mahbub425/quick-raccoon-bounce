import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { PettyCashLedgerEntry } from "@/types";

const Report = () => {
  const { user } = useAuth();
  const { getPettyCashLedger, getPettyCashBalance } = useSubmittedVouchers();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const userPinFromQuery = queryParams.get('userPin');
  const reportTypeFromQuery = queryParams.get('reportType');

  const targetUserPin = userPinFromQuery || user?.pin;

  const userLedger = useMemo(() => {
    if (!targetUserPin) return [];
    return getPettyCashLedger(targetUserPin);
  }, [targetUserPin, getPettyCashLedger]);

  const currentBalance = useMemo(() => {
    if (!targetUserPin) return 0;
    return getPettyCashBalance(targetUserPin);
  }, [targetUserPin, getPettyCashBalance]);

  const getBranchName = (branchId: string) => {
    // Assuming all institutions have a 'bogura' branch for simplicity as per dummyData
    const institution = DUMMY_INSTITUTIONS.find(inst => inst.branches.some(b => b.id === branchId));
    return institution?.branches.find(branch => branch.id === branchId)?.name || branchId;
  };

  const getPettyCashTypeLabel = (typeValue: string) => {
    const pettyCashVoucher = DUMMY_VOUCHER_TYPES.find(v => v.id === 'petty-cash-demand');
    const pettyCashTypeField = pettyCashVoucher?.formFields?.find(f => f.name === 'pettyCashType');
    return pettyCashTypeField?.options?.find(opt => opt.value === typeValue)?.label || typeValue;
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 p-6">
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          রিপোর্ট দেখতে লগইন করুন।
        </div>
      </div>
    );
  }

  if (!targetUserPin) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 p-6">
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          কোনো ব্যবহারকারী নির্বাচন করা হয়নি।
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
        পেটি ক্যাশ লেজার রিপোর্ট ({targetUserPin})
      </h1>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Balance Card */}
        <Card className={cn(
          "p-6 shadow-lg border-2",
          currentBalance >= 0 ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-700">ব্যালেন্স</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {currentBalance >= 0 ? (
              <p className="text-3xl font-extrabold text-red-700">
                আপনি প্রতিষ্ঠানকে ফেরত দিবেন: {currentBalance.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            ) : (
              <p className="text-3xl font-extrabold text-green-700">
                আপনি প্রতিষ্ঠান হতে পাবেন: {Math.abs(currentBalance).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Petty Cash Ledger Table */}
        <Card className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-blue-700">পেটি ক্যাশ লেজার</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100">
                    <TableHead className="w-[50px]">ক্রমিক</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>উত্তলনের শাখা</TableHead>
                    <TableHead>পেটিক্যাশের ধরন</TableHead>
                    <TableHead className="text-right">উত্তলনের পরিমান</TableHead>
                    <TableHead className="text-right">সমন্বয়ের পরিমান</TableHead>
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
                        <TableCell className="text-right">{(entry.withdrawalAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">{(entry.adjustmentAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;