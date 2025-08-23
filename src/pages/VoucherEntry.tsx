import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoucherCard from "@/components/VoucherCard";
import { DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { VoucherType } from "@/types";
import { cn } from "@/lib/utils";

const VoucherEntry = () => {
  const navigate = useNavigate();
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
  const [collapsedMultiTypes, setCollapsedMultiTypes] = useState<string[]>([]);

  // IDs of the vouchers to hide from the single type section
  const hiddenSingleTypeVoucherIds = [
    "publicity-publicist-bill",
    "publicity-entertainment",
    "publicity-conveyance",
  ];

  const singleTypeVouchers = DUMMY_VOUCHER_TYPES.filter(
    (v) => v.type === "single" && !hiddenSingleTypeVoucherIds.includes(v.id)
  );
  const multiTypeVouchers = DUMMY_VOUCHER_TYPES.filter((v) => v.type === "multi");

  const handleSelectVoucher = (id: string, isSelected: boolean) => {
    setSelectedVoucherIds((prev) =>
      isSelected ? [...prev, id] : prev.filter((voucherId) => voucherId !== id),
    );
  };

  const handleToggleCollapse = (id: string) => {
    setCollapsedMultiTypes((prev) =>
      prev.includes(id) ? prev.filter((multiId) => multiId !== id) : [...prev, id],
    );
  };

  const handleSendToSelected = () => {
    if (selectedVoucherIds.length === 0) {
      alert("অনুগ্রহ করে অন্তত একটি ভাউচার নির্বাচন করুন।");
      return;
    }
    navigate("/selected-vouchers", { state: { selectedVoucherIds } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
        ভাউচার টাইপ নির্বাচন করুন
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Multi Type Vouchers (Left Section) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200">
          <h2 className="text-2xl font-bold text-purple-700 mb-6 border-b pb-3 border-purple-300">
            মাল্টি টাইপ ভাউচার
          </h2>
          <div className="space-y-4">
            {multiTypeVouchers.map((multiVoucher) => (
              <div key={multiVoucher.id} className="border border-purple-100 rounded-lg p-2 bg-purple-50">
                <VoucherCard
                  voucher={multiVoucher}
                  isSelected={false} // Multi-type cards themselves are not "selected" for submission
                  onSelect={() => {}}
                  isMultiType
                  onToggleCollapse={handleToggleCollapse}
                  isCollapsed={collapsedMultiTypes.includes(multiVoucher.id)}
                />
                {!collapsedMultiTypes.includes(multiVoucher.id) && multiVoucher.subTypes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-4 border-purple-300">
                    {multiVoucher.subTypes.map((subVoucher) => (
                      <VoucherCard
                        key={subVoucher.id}
                        voucher={subVoucher}
                        isSelected={selectedVoucherIds.includes(subVoucher.id)}
                        onSelect={handleSelectVoucher}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Single Type Vouchers (Right Section) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
          <h2 className="text-2xl font-bold text-green-700 mb-6 border-b pb-3 border-green-300">
            সিঙ্গেল টাইপ ভাউচার
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {singleTypeVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                isSelected={selectedVoucherIds.includes(voucher.id)}
                onSelect={handleSelectVoucher}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <Button
          onClick={handleSendToSelected}
          className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white text-xl py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          নির্বাচিত আইটেমে পাঠান ({selectedVoucherIds.length})
        </Button>
      </div>
    </div>
  );
};

export default VoucherEntry;