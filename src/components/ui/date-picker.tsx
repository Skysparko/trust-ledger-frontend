"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  id,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Parse date value - handle both "yyyy-MM-dd" and ISO format strings
  // Always use local time to avoid timezone issues
  const date = React.useMemo(() => {
    if (!value) return undefined;
    // If it's already in "yyyy-MM-dd" format, parse it directly using local time
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      // Create date at noon local time to avoid timezone shifts
      // month is 1-12 in the string, but Date constructor expects 0-11
      const parsedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      
      // Verify the parsed date matches the input - if not, there's a serious issue
      const verifyYear = parsedDate.getFullYear();
      const verifyMonth = parsedDate.getMonth() + 1;
      const verifyDay = parsedDate.getDate();
      
      if (verifyYear !== year || verifyMonth !== month || verifyDay !== day) {
        console.error('DatePicker: Date parsing mismatch!', {
          input: value,
          expected: { year, month, day },
          parsed: { year: verifyYear, month: verifyMonth, day: verifyDay }
        });
      } else {
        // Debug: Log successful parsing
        console.log('DatePicker: Date parsed successfully', {
          input: value,
          parsed: { year: verifyYear, month: verifyMonth, day: verifyDay },
          displayFormat: format(parsedDate, "PPP")
        });
      }
      
      return parsedDate;
    }
    // Otherwise, parse as ISO string and extract date part
    // If it's an ISO string, extract the date components to avoid timezone issues
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return undefined;
    // Extract date components using local time methods and create a new date in local time
    // This ensures we always work with local dates, never UTC
    const year = parsed.getFullYear();
    const month = parsed.getMonth();
    const day = parsed.getDate();
    return new Date(year, month, day, 12, 0, 0, 0);
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // CRITICAL: Extract date components using local time methods
      // getFullYear(), getMonth(), getDate() always return local time values
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // getMonth() returns 0-11, so add 1 for display
      const day = selectedDate.getDate();
      
      // Format with zero-padding as "yyyy-MM-dd"
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Debug: Log what we're storing
      console.log('DatePicker handleSelect:', {
        receivedDate: selectedDate.toString(),
        extracted: { year, month, day },
        formatted: formattedDate
      });
      
      onChange?.(formattedDate);
    } else {
      onChange?.("");
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-11 px-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-500",
            !date && "text-zinc-500 dark:text-zinc-400",
            date && "text-zinc-900 dark:text-zinc-50",
            className?.includes("border-red-500") && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-xl border-zinc-200 dark:border-zinc-800" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          month={date} // Ensure calendar shows the month of the selected date
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

