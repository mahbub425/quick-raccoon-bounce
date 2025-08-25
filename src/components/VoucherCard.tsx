import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { VoucherType } from "@/types";
import { cn } from "@/lib/utils";

interface VoucherCardProps {
  voucher: VoucherType;
  isSelected: boolean;
  onSelect: (id: string, isSelected: boolean) => void;
  isMultiType?: boolean;
  onToggleCollapse?: (id: string) => void;
  isCollapsed?: boolean;
  icon: React.ElementType; // New prop for the icon
}

const VoucherCard = ({
  voucher,
  isSelected,
  onSelect,
  isMultiType = false,
  onToggleCollapse,
  isCollapsed,
  icon: Icon, // Destructure and rename icon to Icon for JSX
}: VoucherCardProps) => {
  const handleCardClick = () => {
    if (isMultiType && onToggleCollapse) {
      onToggleCollapse(voucher.id);
    } else {
      onSelect(voucher.id, !isSelected);
    }
  };

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105",
        isSelected ? "border-4 border-blue-500 shadow-lg bg-blue-50" : "border-2 border-gray-200 bg-white",
        isMultiType ? "bg-gradient-to-r from-purple-100 to-pink-100" : "bg-gradient-to-r from-green-50 to-blue-50"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2"> {/* Container for icon and title */}
          <Icon className={cn("h-6 w-6", isMultiType ? "text-purple-700" : "text-blue-700")} /> {/* Render the icon with dynamic color */}
          <CardTitle className="text-lg font-bold text-gray-800">
            {voucher.heading}
          </CardTitle>
        </div>
        {!isMultiType && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(voucher.id, !!checked)}
            className="h-5 w-5 border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
            aria-label={`Select ${voucher.heading}`}
            onClick={(e) => e.stopPropagation()} // Prevent card click from triggering checkbox
          />
        )}
        {isMultiType && onToggleCollapse && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              "h-6 w-6 text-gray-600 transition-transform duration-200",
              isCollapsed ? "rotate-0" : "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-gray-600">
          {voucher.shortDescription}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default VoucherCard;