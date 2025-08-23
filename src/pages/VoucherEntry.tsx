import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoucherCard from "@/components/VoucherCard";
import { DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { cn } from "@/lib/utils";

const VoucherEntry = () => {
  const navigate = useNavigate();
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
  const [collapsedMultiTypes, setCollapsedMultiTypes] = useState<string[]>([]);

  // IDs of the vouchers that are special sub-forms and should NOT appear as selectable cards
  // in the main VoucherEntry list, but are handled within other forms (e.g., Publicity main form).
  const hiddenVoucherIds = [
    "publicity-conveyance", 
    "publicity-entertainment", 
    "publicity-publicist-bill", 
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {DUMMY_VOUCHER_TYPES
          .filter(v => !hiddenVoucherIds.includes(v.id)) // Filter out explicitly hidden top-level vouchers
          .map((voucher) => (
            <div key={voucher.id} className="col-span-1">
              {voucher.type === "multi" ? (
                <div className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm"> {/* Added a container for multi-type card and its sub-types */}
                  <VoucherCard
                    voucher={voucher}
                    isSelected={false} // Multi-type cards themselves are not "selected" for submission
                    onSelect={() => {}}
                    isMultiType
                    onToggleCollapse={handleToggleCollapse}
                    isCollapsed={collapsedMultiTypes.includes(voucher.id)}
                  />
                  {!collapsedMultiTypes.includes(voucher.id) && voucher.subTypes && (
                    <div className="grid grid-cols-1 gap-4 mt-4 pl-4 border-l-4 border-purple-300">
                      {voucher.subTypes
                        .map((subVoucher) => ( // Removed filtering here to always show sub-types
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
              ) : (
                <VoucherCard
                  voucher={voucher}
                  isSelected={selectedVoucherIds.includes(voucher.id)}
                  onSelect={handleSelectVoucher}
                />
              )}
            </div>
          ))}
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