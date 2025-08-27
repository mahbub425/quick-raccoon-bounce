import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENT_TYPES } from "@/data/dummyData";
import { cn } from "@/lib/utils"; // Import cn for conditional classnames

const MakePayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | undefined>(undefined);

  // Determine if an error should be shown for the search input
  const showSearchError = searchTerm.trim() !== "" && selectedPaymentType === undefined;

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
              className={cn("w-full", showSearchError && "border-red-500 focus:border-red-500 focus:ring-red-500")} // Add red border on error
            />
            {showSearchError && (
              <p className="text-red-500 text-sm mt-1">পেমেন্টের ধরণ নির্বাচন করুন</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for data display with conditional message */}
      <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200 max-w-4xl mx-auto">
        {!selectedPaymentType ? (
          <p>পেমেন্টের ধরণ নির্বাচন করুন</p> // Simplified message
        ) : (
          <p>
            আপনি "{PAYMENT_TYPES.find(p => p.value === selectedPaymentType)?.label}" নির্বাচন করেছেন।
            এখানে সংশ্লিষ্ট ডাটা দেখানো হবে।
          </p>
        )}
      </div>
    </div>
  );
};

export default MakePayment;