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
  const date = React.useMemo(() => {
    if (!value) return undefined;
    // If it's already in "yyyy-MM-dd" format, parse it directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    // Otherwise, parse as ISO string and extract date part
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Format as "yyyy-MM-dd" using local date (not UTC)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
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
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

