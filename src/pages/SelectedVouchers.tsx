import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { toast } from "sonner";

const SelectedVouchers = () => {
  const location = useLocation();
  const selectedVoucherIds: string[] = location.state?.selectedVoucherIds || [];

  const getVoucherDetails = (id: string) => {
    const allVouchers = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]);
    return allVouchers.find(v => v.id === id);
  };

  const selectedVouchers = selectedVoucherIds.map(getVoucherDetails).filter(Boolean);

  if (selectedVouchers.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-4">কোনো ভাউচার নির্বাচন করা হয়নি!</h1>
        <p className="text-lg text-gray-600 mb-6">অনুগ্রহ করে ভাউচার এন্ট্রি পেজ থেকে ভাউচার নির্বাচন করুন।</p>
        <Button onClick={() => window.history.back()} className="bg-red-500 hover:bg-red-600 text-white text-lg py-2 px-6 rounded-md shadow-md">
          ফিরে যান
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
        আপনার নির্বাচিত ভাউচার সমূহ
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {selectedVouchers.map((voucher) => (
          <Button
            key={voucher?.id}
            variant="outline"
            className="bg-white text-blue-700 border-blue-400 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 ease-in-out shadow-md"
            onClick={() => toast.info(`ফর্ম লোড হচ্ছে: ${voucher?.heading}`)}
          >
            {voucher?.heading}
          </Button>
        ))}
      </div>

      <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
        সংশ্লিষ্ট ফর্ম দেখতে যে কোনো একটি ভাউচার বোতামে ক্লিক করুন।
      </div>

      {/* Forms will be rendered here based on selected button */}
    </div>
  );
};

export default SelectedVouchers;