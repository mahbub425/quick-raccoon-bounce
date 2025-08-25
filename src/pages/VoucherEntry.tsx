import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoucherCard from "@/components/VoucherCard";
import { DUMMY_VOUCHER_TYPES, SUPPORT_STAFF_ALLOWED_VOUCHER_TYPES_IDS } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import {
  Ticket, Utensils, Car, Megaphone, Award, Clipboard, Sparkles, CookingPot,
  Receipt, Smartphone, Building, Wrench, Wallet, BookText, ReceiptText
} from "lucide-react"; // Import necessary icons

// Map voucher IDs to Lucide React icons
const voucherIcons: { [key: string]: React.ElementType } = {
  "entertainment-conveyance-multi": Ticket,
  "entertainment": Utensils,
  "conveyance": Car,
  "publicity-students-inspiration-multi": Megaphone,
  "publicity": Megaphone,
  "publicity-students-inspiration": Award,
  "stationery-maintenance-multi": Clipboard,
  "office-supplies-stationery": Clipboard,
  "cleaning-supplies": Sparkles,
  "kitchen-household-items": CookingPot,
  "debit-credit-journal-multi": Receipt,
  "mobile-bill": Smartphone,
  "rental-utility": Building,
  "repair": Wrench,
  "petty-cash": Wallet,
};

const VoucherEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user from AuthContext
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
  
  // Initialize collapsedMultiTypes to have all multi-type voucher IDs, making them collapsed by default
  const [collapsedMultiTypes, setCollapsedMultiTypes] = useState<string[]>(() => {
    return DUMMY_VOUCHER_TYPES
      .filter(v => v.type === 'multi')
      .map(v => v.id);
  });

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
    setCollapsedMultiTypes((prev) => {
      const allMultiTypeIds = DUMMY_VOUCHER_TYPES
        .filter(v => v.type === 'multi')
        .map(v => v.id);

      if (prev.includes(id)) {
        // If it was collapsed, expand it and collapse all others
        return allMultiTypeIds.filter(multiId => multiId !== id);
      } else {
        // If it was expanded, collapse it
        return [...prev, id];
      }
    });
  };

  const handleSendToSelected = () => {
    if (selectedVoucherIds.length === 0) {
      alert("অনুগ্রহ করে অন্তত একটি ভাউচার নির্বাচন করুন।");
      return;
    }

    let selectedVouchersPath = "/selected-vouchers";
    if (user && user.role !== 'user') {
      selectedVouchersPath = `/${user.role}${selectedVouchersPath}`;
    }
    
    navigate(selectedVouchersPath, { state: { selectedVoucherIds } });
  };

  // Filter vouchers based on user designation
  const visibleVoucherTypes = DUMMY_VOUCHER_TYPES
    .filter(v => !hiddenVoucherIds.includes(v.id)) // Existing filter for sub-types
    .filter(v => {
      if (user?.designation === "Support Staff") {
        return SUPPORT_STAFF_ALLOWED_VOUCHER_TYPES_IDS.includes(v.id);
      }
      return true; // All other designations see all non-hidden vouchers
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
        ভাউচার টাইপ নির্বাচন করুন
      </h1>

      <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
        {visibleVoucherTypes // Use the filtered list here
          .map((voucher) => (
            <div key={voucher.id} className="w-full md:w-[calc(50%-0.5rem)]"> {/* Adjusted width for flex layout */}
              {voucher.type === "multi" ? (
                <div className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm"> {/* Added a container for multi-type card and its sub-types */}
                  <VoucherCard
                    voucher={voucher}
                    isSelected={false} // Multi-type cards themselves are not "selected" for submission
                    onSelect={() => {}}
                    isMultiType
                    onToggleCollapse={handleToggleCollapse}
                    isCollapsed={collapsedMultiTypes.includes(voucher.id)}
                    icon={voucherIcons[voucher.id] || Ticket} // Pass the icon
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
                            icon={voucherIcons[subVoucher.id] || Ticket} // Pass the icon
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
                  icon={voucherIcons[voucher.id] || Ticket} // Pass the icon
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