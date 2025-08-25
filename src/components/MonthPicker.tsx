"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // shadcn/ui Calendar
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, setYear, getYear, setMonth, getMonth, addMonths, subMonths } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { CaptionProps, useNavigation } from "react-day-picker"; // Import CaptionProps and useNavigation

interface MonthPickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

const MonthPicker = ({ value, onChange, placeholder, className }: MonthPickerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(value);
  const [viewedMonth, setViewedMonth] = useState<Date>(value || new Date()); // Month currently shown in calendar

  useEffect(() => {
    setSelectedMonth(value);
    if (value) {
      setViewedMonth(value); // Sync viewedMonth with selected value
    }
  }, [value]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    if (!isNaN(year) && year >= 1900 && year <= 2100) { // Basic year validation
      setViewedMonth(setYear(viewedMonth, year)); // Update the year of the viewed month
    }
  };

  const handleMonthSelect = (date: Date | undefined) => {
    setSelectedMonth(date);
    onChange(date);
    if (date) {
      setViewedMonth(date); // Keep viewed month in sync with selected
    }
    setOpen(false); // Close popover after selection
  };

  const handleClear = () => {
    setSelectedMonth(undefined);
    onChange(undefined);
    setViewedMonth(new Date()); // Reset viewed month to current
    setOpen(false);
  };

  const handleThisMonth = () => {
    const today = new Date();
    setSelectedMonth(today);
    onChange(today);
    setViewedMonth(today); // Set viewed month to today
    setOpen(false);
  };

  const CustomCaption = (props: CaptionProps) => {
    const { displayMonth } = props;
    const { goToMonth } = useNavigation(); // Use useNavigation hook to get goToMonth

    const handlePrevMonth = () => {
      goToMonth(subMonths(displayMonth, 1));
    };

    const handleNextMonth = () => {
      goToMonth(addMonths(displayMonth, 1));
    };

    return (
      <div className="flex items-center justify-between px-4 py-2">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold">
          {format(displayMonth, "MMMM yyyy")}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal border-blue-300 focus:border-blue-500 focus:ring-blue-500",
            !selectedMonth && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedMonth ? format(selectedMonth, "MMMM yyyy") : (placeholder || "মাস নির্বাচন করুন")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 border-b">
          <Input
            type="number"
            placeholder="বছর"
            value={getYear(viewedMonth)} // Display year from viewedMonth
            onChange={handleYearChange}
            className="w-full text-center border-none focus-visible:ring-0"
          />
        </div>
        <Calendar
          mode="single"
          selected={selectedMonth}
          onSelect={handleMonthSelect}
          initialFocus
          // @ts-ignore: 'view' prop is supported by react-day-picker but might be missing from shadcn/ui's Calendar types
          view="months" // This is the key for month-only view
          month={viewedMonth} // Control the displayed month
          onMonthChange={setViewedMonth} // Update viewedMonth when internal navigation occurs
          components={{
            Caption: CustomCaption, // Use the custom caption
          }}
          className="p-2"
        />
        <div className="flex justify-between p-2 border-t">
          <Button variant="ghost" onClick={handleClear} className="text-blue-500 hover:text-blue-700">
            Clear
          </Button>
          <Button variant="ghost" onClick={handleThisMonth} className="text-blue-500 hover:text-blue-700">
            This month
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MonthPicker;