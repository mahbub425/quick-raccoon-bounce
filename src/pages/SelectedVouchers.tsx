import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { toast } from "sonner";
import DynamicVoucherForm from "@/components/forms/DynamicVoucherForm";

const SelectedVouchers = () => {
  const location = useLocation();
  const selectedVoucherIds: string[] = location.state?.selectedVoucherIds || [];
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeSubFormId, setActiveSubFormId] = useState<string | null>(null); // State for sub-forms

  const getVoucherDetails = (id: string) => {
    const allVouchers = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]);
    return allVouchers.find(v => v.id === id);
  };

  const selectedVouchers = selectedVoucherIds.map(getVoucherDetails).filter(Boolean);

  const handleFormLoad = (voucherId: string) => {
    setActiveFormId(voucherId);
    setActiveSubFormId(null); // Reset sub-form when main form changes
    toast.info(`ফর্ম লোড হচ্ছে: ${getVoucherDetails(voucherId)?.heading}`);
  };

  const handleSubFormLoad = (subVoucherId: string) => {
    setActiveSubFormId(subVoucherId);
    toast.info(`সাব-ফর্ম লোড হচ্ছে: ${getVoucherDetails(subVoucherId)?.heading}`);
  };

  const handleMainFormSubmissionComplete = () => {
    setActiveFormId(null); // Reset main form after submission
    setActiveSubFormId(null); // Also reset sub-form if any was active
  };

  const handleSubFormSubmissionComplete = () => {
    setActiveSubFormId(null); // Only reset the sub-form, keep the main form active
  };

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
            variant={activeFormId === voucher?.id ? "default" : "outline"}
            className={activeFormId === voucher?.id ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-blue-700 border-blue-400 hover:bg-blue-100 hover:text-blue-800"}
            onClick={() => handleFormLoad(voucher?.id || "")}
          >
            {voucher?.heading}
          </Button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        {!activeFormId ? (
          <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
            সংশ্লিষ্ট ফর্ম দেখতে যে কোনো একটি ভাউচার বোতামে ক্লিক করুন।
          </div>
        ) : (
          <>
            <DynamicVoucherForm voucherTypeId={activeFormId} onFormSubmit={activeFormId === 'publicity' ? undefined : handleMainFormSubmissionComplete} />

            {activeFormId === 'publicity' && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow<dyad-problem-report summary="3 problems">
<problem file="src/pages/SelectedVouchers.tsx" line="83" column="36" code="2552">Cannot find name 'handleSubFormLoad'. Did you mean 'handleFormLoad'?</problem>
<problem file="src/pages/SelectedVouchers.tsx" line="90" column="36" code="2552">Cannot find name 'handleSubFormLoad'. Did you mean 'handleFormLoad'?</problem>
<problem file="src/pages/SelectedVouchers.tsx" line="97" column="36" code="2552">Cannot find name 'handleSubFormLoad'. Did you mean 'handleFormLoad'?</problem>
</dyad-problem-report><think>**Analyzing TypeScript Errors**

I've homed in on three TypeScript compile-time errors within `src/pages/Selected Vouchers.tsx`. It seems `handleSubFormLoad` is eluding the compiler, suggesting a possible typo or misreference. I'm double-checking the function's declaration and usage throughout the codebase to pinpoint the discrepancy.


**Refining Code Implementation**

My focus has shifted to fully implementing the `handleSubFormLoad` function within `src/pages/Selected Vouchers.tsx`. I realized a truncation error in my last `dyad-write` block prevented its declaration. I'm now crafting the complete file, including the correctly defined function, to resolve those persistent TypeScript errors. I'm ensuring the function correctly sets `activeSubFormId` and displays a notification.


</think>আপনার `src/pages/SelectedVouchers.tsx` ফাইলে `handleSubFormLoad` ফাংশনটি অসম্পূর্ণ ছিল, যার কারণে এই TypeScript ত্রুটিগুলো দেখা যাচ্ছিল। আমি `handleSubFormLoad` ফাংশনটি সম্পূর্ণ করে ফাইলটি আপডেট করছি।

<dyad-write path="src/pages/SelectedVouchers.tsx" description="Completing the handleSubFormLoad function definition to resolve TypeScript errors.">
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { toast } from "sonner";
import DynamicVoucherForm from "@/components/forms/DynamicVoucherForm";

const SelectedVouchers = () => {
  const location = useLocation();
  const selectedVoucherIds: string[] = location.state?.selectedVoucherIds || [];
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeSubFormId, setActiveSubFormId] = useState<string | null>(null); // State for sub-forms

  const getVoucherDetails = (id: string) => {
    const allVouchers = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]);
    return allVouchers.find(v => v.id === id);
  };

  const selectedVouchers = selectedVoucherIds.map(getVoucherDetails).filter(Boolean);

  const handleFormLoad = (voucherId: string) => {
    setActiveFormId(voucherId);
    setActiveSubFormId(null); // Reset sub-form when main form changes
    toast.info(`ফর্ম লোড হচ্ছে: ${getVoucherDetails(voucherId)?.heading}`);
  };

  const handleSubFormLoad = (subVoucherId: string) => {
    setActiveSubFormId(subVoucherId);
    toast.info(`সাব-ফর্ম লোড হচ্ছে: ${getVoucherDetails(subVoucherId)?.heading}`);
  };

  const handleMainFormSubmissionComplete = () => {
    setActiveFormId(null); // Reset main form after submission
    setActiveSubFormId(null); // Also reset sub-form if any was active
  };

  const handleSubFormSubmissionComplete = () => {
    setActiveSubFormId(null); // Only reset the sub-form, keep the main form active
  };

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
            variant={activeFormId === voucher?.id ? "default" : "outline"}
            className={activeFormId === voucher?.id ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-blue-700 border-blue-400 hover:bg-blue-100 hover:text-blue-800"}
            onClick={() => handleFormLoad(voucher?.id || "")}
          >
            {voucher?.heading}
          </Button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        {!activeFormId ? (
          <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
            সংশ্লিষ্ট ফর্ম দেখতে যে কোনো একটি ভাউচার বোতামে ক্লিক করুন।
          </div>
        ) : (
          <>
            <DynamicVoucherForm voucherTypeId={activeFormId} onFormSubmit={activeFormId === 'publicity' ? undefined : handleMainFormSubmissionComplete} />

            {activeFormId === 'publicity' && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">প্রচারণার উপ-ভাউচার যোগ করুন</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    variant={activeSubFormId === 'publicity-conveyance' ? "default" : "outline"}
                    className={activeSubFormId === 'publicity-conveyance' ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white text-purple-700 border-purple-400 hover:bg-purple-100 hover:text-purple-800"}
                    onClick={() => handleSubFormLoad('publicity-conveyance')}
                  >
                    কনভেয়েন্স
                  </Button>
                  <Button
                    variant={activeSubFormId === 'publicity-entertainment' ? "default" : "outline"}
                    className={activeSubFormId === 'publicity-entertainment' ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white text-purple-700 border-purple-400 hover:bg-purple-100 hover:text-purple-800"}
                    onClick={() => handleSubFormLoad('publicity-entertainment')}
                  >
                    এন্টারটেইনমেন্ট
                  </Button>
                  <Button
                    variant={activeSubFormId === 'publicity-publicist-bill' ? "default" : "outline"}
                    className={activeSubFormId === 'publicity-publicist-bill' ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white text-purple-700 border-purple-400 hover:bg-purple-100 hover:text-purple-800"}
                    onClick={() => handleSubFormLoad('publicity-publicist-bill')}
                  >
                    প্রচারণাকরীর বিল
                  </Button>
                </div>

                {activeSubFormId && (
                  <div className="mt-6">
                    <DynamicVoucherForm voucherTypeId={activeSubFormId} onFormSubmit={handleSubFormSubmissionComplete} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SelectedVouchers;