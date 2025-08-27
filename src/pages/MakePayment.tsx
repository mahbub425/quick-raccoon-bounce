import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { PAYMENT_TYPES, DUMMY_USERS, DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { useNotifications } from "@/context/NotificationContext";
import { toast } from "sonner";
import { generateUniquePettyCashCode, createWithdrawalLedgerEntry } from "@/utils/pettyCashUtils";
import PaymentCodeVerificationPopup from "@/components/PaymentCodeVerificationPopup";
import { format, parseISO } from "date-fns";
import { UserProfile } from "@/types";

const MakePayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | undefined>(undefined);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [isCodeVerificationPopupOpen, setIsCodeVerificationPopupOpen] = useState(false);
  const [userToPay, setUserToPay] = useState<UserProfile | null>(null); // User for whom payment is being processed
  const [paymentCodeToVerify, setPaymentCodeToVerify] = useState<string | null>(null); // Code generated for this payment

  const { getPettyCashBalance, addPettyCashLedgerEntry } = useSubmittedVouchers();
  const { addGeneratedCodeNotification, markCodeAsUsed } = useNotifications();

  // Determine if an error should be shown for the search input
  const showSearchError = searchTerm.trim() !== "" && selectedPaymentType === undefined;

  useEffect(() => {
    if (selectedPaymentType === 'petty_person' && searchTerm.trim() !== "") {
      const user = DUMMY_USERS.find(u => u.pin === searchTerm.trim() || u.username === searchTerm.trim());
      setFoundUser(user || null);
      setPaymentAmount(null); // Reset payment amount when user changes
    } else {
      setFoundUser(null);
      setPaymentAmount(null);
    }
  }, [searchTerm, selectedPaymentType]);

  const userPettyCashBalance = useMemo(() => {
    if (!foundUser) return 0;
    return getPettyCashBalance(foundUser.pin);
  }, [foundUser, getPettyCashBalance]);

  const getBalanceDisplay = (balance: number) => {
    if (balance >= 0) {
      return `আপনি প্রতিষ্ঠানকে ফেরত দিবেন: ${balance.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else {
      return `আপনি প্রতিষ্ঠান হতে পাবেন: ${Math.abs(balance).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };

  const handleGenerateCode = (user: UserProfile) => {
    if (paymentAmount === null || paymentAmount <= 0) {
      toast.error("অনুগ্রহ করে প্রদানকৃত টাকার পরিমাণ 0 এর বেশি লিখুন।");
      return;
    }

    const newCode = generateUniquePettyCashCode();
    addGeneratedCodeNotification(user.pin, newCode, paymentAmount);
    setPaymentCodeToVerify(newCode); // Store the generated code for verification
    setUserToPay(user); // Store the user for whom the code was generated
    toast.success(`পিন ${user.pin} এর জন্য কোডটি সফলভাবে তৈরি হয়েছে এবং পাঠানো হয়েছে`);
    setPaymentAmount(null); // Clear the input after generating code
  };

  const handlePayment = (user: UserProfile) => {
    if (paymentAmount === null || paymentAmount <= 0) {
      toast.error("অনুগ্রহ করে প্রদানকৃত টাকার পরিমাণ 0 এর বেশি লিখুন।");
      return;
    }
    setUserToPay(user);
    setIsCodeVerificationPopupOpen(true);
  };

  const handleVerifyCodeAndPay = (inputCode: string) => {
    if (!userToPay || !paymentCodeToVerify) {
      console.error("No user or code to process for verification.");
      toast.error("পেমেন্ট প্রক্রিয়াকরণে ত্রুটি।");
      return;
    }

    // Check if the code is valid and not used
    const isCodeValidAndUnused = markCodeAsUsed(userToPay.pin, inputCode.toUpperCase());

    if (isCodeValidAndUnused) {
      // Create a dummy voucher for ledger entry purposes
      const dummyVoucherForLedger = {
        submittedByPin: userToPay.pin,
        data: {
          branchId: DUMMY_INSTITUTIONS[0].branches[0].id, // Assuming a default branch for ledger entry
          amount: paymentAmount, // Use the amount from the payment input
        },
        voucherHeading: "পেটি ক্যাশ উত্তোলন",
        voucherNumber: "N/A", // Not tied to a specific voucher number from submittedVouchers
        approvedAmount: paymentAmount, // Use the amount from the payment input
      };

      addPettyCashLedgerEntry(createWithdrawalLedgerEntry(dummyVoucherForLedger as any)); // Cast to any for simplicity
      toast.success(`পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!`);
      setIsCodeVerificationPopupOpen(false);
      setPaymentAmount(null); // Clear amount after successful payment
      setPaymentCodeToVerify(null);
      setUserToPay(null);
    } else {
      toast.error("আপনি ভুল কোড প্রবেশ করিয়েছেন অথবা কোডটি ইতিমধ্যেই ব্যবহৃত হয়েছে।");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
        পেমেন্ট করুন
      </h1>

      <Card className="mb-8 p-6 shadow-lg border-blue-300 bg-white max-w-4xl mx-auto">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dropdown Filter */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="paymentType" className="text-sm font-medium text-gray-700">পেমেন্টের ধরণ নির্বাচন করুন</label>
            <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="পেমেন্টের ধরণ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="search" className="text-sm font-medium text-gray-700">সার্চ করুন</label>
            <Input
              id="search"
              placeholder="নাম বা আইডি দিয়ে সার্চ করুন"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn("w-full", showSearchError && "border-red-500 focus:border-red-500 focus:ring-red-500")}
              disabled={selectedPaymentType !== 'petty_person'} // Only enable for petty_person
            />
            {showSearchError && (
              <p className="text-red-500 text-sm mt-1">পেমেন্টের ধরণ নির্বাচন করুন</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Display for Petty Person */}
      {selectedPaymentType === 'petty_person' && (
        <div className="max-w-4xl mx-auto">
          {searchTerm.trim() === "" ? (
            <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
              পিন বা ইউজারনেম দিয়ে সার্চ করুন।
            </div>
          ) : (
            foundUser ? (
              <Card className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-blue-700">পেটিপার্সন তথ্য</CardTitle>
                  <CardDescription className="text-gray-600">নির্বাচিত ইউজারের পেটি ক্যাশ ব্যালেন্স এবং পেমেন্ট অপশন।</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-100">
                          <TableHead>পিন</TableHead>
                          <TableHead>নাম</TableHead>
                          <TableHead>ব্যালেন্স</TableHead>
                          <TableHead>প্রদানকৃত টাকার পরিমাণ</TableHead>
                          <TableHead className="text-center">কোড জেনারেট করুন</TableHead>
                          <TableHead className="text-center">অ্যাকশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">{foundUser.pin}</TableCell>
                          <TableCell>{foundUser.name}</TableCell>
                          <TableCell>
                            <span className={cn(
                              userPettyCashBalance >= 0 ? "text-red-700" : "text-green-700"
                            )}>
                              {getBalanceDisplay(userPettyCashBalance)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="টাকার পরিমাণ"
                              value={paymentAmount === null ? "" : paymentAmount}
                              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || null)}
                              className="w-32 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateCode(foundUser)}
                              disabled={paymentAmount === null || paymentAmount <= 0}
                            >
                              কোড জেনারেট করুন
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handlePayment(foundUser)}
                              disabled={paymentAmount === null || paymentAmount <= 0}
                            >
                              পেমেন্ট
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
                কোনো ইউজার খুঁজে পাওয়া যায়নি।
              </div>
            )
          )}
        </div>
      )}

      {/* Default message when no filter is selected or other filters */}
      {selectedPaymentType !== 'petty_person' && (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200 max-w-4xl mx-auto">
          {!selectedPaymentType ? (
            <p>পেমেন্টের ধরণ নির্বাচন করুন</p>
          ) : (
            <p>
              আপনি "{PAYMENT_TYPES.find(p => p.value === selectedPaymentType)?.label}" নির্বাচন করেছেন।
              এখানে সংশ্লিষ্ট ডাটা দেখানো হবে।
            </p>
          )}
        </div>
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

export default MakePayment;