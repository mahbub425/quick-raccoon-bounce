"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // shadcn/ui Calendar
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, setYear, getYear, setMonth, getMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface MonthPickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

const MonthPicker = ({ value, onChange, placeholder, className }: MonthPickerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(value);
  const [displayYear, setDisplayYear] = useState(value ? getYear(value) : getYear(new Date()));

  useEffect(() => {
    setSelectedMonth(value);
    if (value) {
      setDisplayYear(getYear(value));
    }
  }, [value]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    if (!isNaN(year) && year >= 1900 && year <= 2100) { // Basic year validation
      setDisplayYear(year);
      if (selectedMonth) {
        setSelectedMonth(setYear(selectedMonth, year));
      } else {
        // If no month selected, set to current month of the new year
        setSelectedMonth(setYear(new Date(), year));
      }
    }
  };

  const handleMonthSelect = (date: Date | undefined) => {
    setSelectedMonth(date);
    onChange(date);
    setOpen(false); // Close popover after selection
  };

  const handleClear = () => {
    setSelectedMonth(undefined);
    onChange(undefined);
    setOpen(false);
  };

  const handleThisMonth = () => {
    const today = new Date();
    // Set to current month of the currently displayed year
    setSelectedMonth(setMonth(setYear(today, displayYear), getMonth(today)));
    onChange(setMonth(setYear(today, displayYear), getMonth(today)));
    setOpen(false);
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
            value={displayYear}
            onChange={handleYearChange}
            className="w-full text-center border-none focus-visible:ring-0"
          />
        </div>
        <Calendar
          mode="single"
          selected={selectedMonth}
          onSelect={handleMonthSelect}
          initialFocus
          view="months" // This is the key for month-only view
          numberOfMonths={1} // Explicitly show only one month grid (one year of months)
          month={setYear(selectedMonth || new Date(), displayYear)} // Ensure calendar displays correct year
          onMonthChange={(month) => setDisplayYear(getYear(month))} // Update displayYear when navigating months
          // Custom components to hide default navigation as we have a custom year input
          components={{
            Caption: () => null, // Hide default caption (month/year display)
          }}
          classNames={{
            // The container for all months (the grid itself)
            months: "w-full",
            // The table element, which will be our grid container
            table: "w-full grid grid-cols-4 gap-1", // 4 columns for months
            // Each row in the grid (we want them to be part of the grid, not separate rows)
            row: "contents", 
            // The individual cell (td) wrapping each month
            cell: "p-0 relative focus-within:relative focus-within:z-20",
            // The actual month element (div with role="button")
            // This is where the main styling for each month goes
            day: cn( // Use 'day' to style individual month elements when view="months"
              "h-10 w-10 rounded-md p-0 font-normal text-sm flex items-center justify-center", // Base style
              "hover:bg-accent hover:text-accent-foreground", // Hover state
              "focus:bg-accent focus:text-accent-foreground", // Focus state
            ),
            // Styling for the selected month. When view="months", react-day-picker applies day_selected to the chosen month.
            day_selected: "bg-sidebar-primary text-sidebar-primary-foreground border border-black",
            // Styling for the current month (today)
            day_today: "bg-accent text-accent-foreground",
            // Styling for months outside the current view (if applicable, e.g., if showing multiple years)
            day_outside: "text-muted-foreground opacity-50",
            // Styling for disabled months
            day_disabled: "text-muted-foreground opacity-50",
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