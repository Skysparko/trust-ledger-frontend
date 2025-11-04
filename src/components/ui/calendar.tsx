"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Custom month dropdown component
const MonthDropdown = ({ month, months, onSelect }: { month: number; months: string[]; onSelect: (month: number) => void }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-zinc-50 px-2 py-1 rounded hover:bg-zinc-700/50 focus:outline-none focus:ring-1 focus:ring-zinc-500">
        {months[month]}
        <ChevronDown className="h-3 w-3 text-zinc-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-h-[200px] overflow-y-auto dark:bg-zinc-900 dark:border-zinc-800">
        {months.map((m, i) => (
          <DropdownMenuItem
            key={i}
            className={cn(
              "cursor-pointer text-zinc-50 hover:bg-zinc-800 focus:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800",
              i === month && "bg-blue-600 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-600"
            )}
            onClick={() => {
              onSelect(i);
              setOpen(false);
            }}
          >
            {m}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Custom year dropdown component
const YearDropdown = ({ year, years, onSelect }: { year: number; years: number[]; onSelect: (year: number) => void }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-zinc-50 px-2 py-1 rounded hover:bg-zinc-700/50 focus:outline-none focus:ring-1 focus:ring-zinc-500">
        {year}
        <ChevronDown className="h-3 w-3 text-zinc-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-h-[200px] overflow-y-auto dark:bg-zinc-900 dark:border-zinc-800">
        {years.map((y) => (
          <DropdownMenuItem
            key={y}
            className={cn(
              "cursor-pointer text-zinc-50 hover:bg-zinc-800 focus:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800",
              y === year && "bg-blue-600 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-600"
            )}
            onClick={() => {
              onSelect(y);
              setOpen(false);
            }}
          >
            {y}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<number>(new Date().getMonth());
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  
  // Generate year range (current year ± 10 years)
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }, []);
  
  const months = React.useMemo(() => {
    return [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  }, []);
  
  React.useEffect(() => {
    // Add custom styles for hiding native select elements
    const style = document.createElement('style');
    style.textContent = `
      .rdp-dropdown select,
      .rdp-caption_dropdown select {
        display: none !important;
      }
      .rdp-caption_dropdowns {
        z-index: 10;
        position: relative;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    const newDate = new Date(year, newMonth, 1);
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };
  
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    const newDate = new Date(newYear, month, 1);
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };
  
  // Update month/year when props change
  React.useEffect(() => {
    if (props.month) {
      setMonth(props.month.getMonth());
      setYear(props.month.getFullYear());
    }
  }, [props.month]);

  return (
    <div className={cn("relative", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        captionLayout="dropdown"
        month={props.month || new Date(year, month, 1)}
        onMonthChange={(date) => {
          setMonth(date.getMonth());
          setYear(date.getFullYear());
          props.onMonthChange?.(date);
        }}
        className="p-4"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-between items-center pt-1 mb-4 px-2 py-2 rounded-lg bg-zinc-800/50 dark:bg-zinc-800/50 relative",
          caption_label: "hidden",
          caption_dropdowns: "flex items-center gap-2 absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none",
          caption_dropdown: "hidden",
          caption_dropdown_month: "hidden",
          caption_dropdown_year: "hidden",
          dropdown: "hidden",
          dropdown_month: "hidden",
          dropdown_year: "hidden",
          dropdown_icon: "hidden",
        nav: "flex items-center gap-1 w-full justify-between",
        nav_button: cn(
          "h-8 w-8 rounded-lg flex items-center justify-center bg-transparent hover:bg-zinc-700/50 dark:hover:bg-zinc-700/50 transition-colors duration-200 p-0 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-500"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell:
          "text-zinc-400 dark:text-zinc-400 rounded-md w-10 font-medium text-xs uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 transition-all duration-200"
        ),
        day_button:
          "h-10 w-10 rounded-lg p-0 font-medium text-sm transition-all duration-200 text-zinc-50 dark:text-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-800 hover:text-zinc-50 focus:bg-zinc-800 dark:focus:bg-zinc-800 focus:text-zinc-50 focus:outline-none",
        day_range_end: "day-range-end",
        day_selected:
          "bg-zinc-700 dark:bg-zinc-700 text-white hover:bg-zinc-600 dark:hover:bg-zinc-600 hover:text-white focus:bg-zinc-600 dark:focus:bg-zinc-600 focus:text-white font-semibold",
        day_today:
          "bg-zinc-800/50 dark:bg-zinc-800/50 text-zinc-50 dark:text-zinc-50 font-semibold border border-zinc-700 dark:border-zinc-700",
        day_outside:
          "day-outside text-zinc-600 dark:text-zinc-600 opacity-40 aria-selected:bg-zinc-800/30 aria-selected:text-zinc-600 aria-selected:opacity-20 dark:aria-selected:bg-zinc-800/30 dark:aria-selected:text-zinc-600",
        day_disabled: "text-zinc-700 dark:text-zinc-700 opacity-40 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-zinc-800 aria-selected:text-zinc-50 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50",
        day_hidden: "invisible",
        ...classNames,
      }}
        components={{
          Chevron: ({ orientation }) => {
            const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
            return <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-400" />;
          },
        }}
      {...props}
      />
      {/* Custom dropdowns positioned over the native ones */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 pointer-events-auto">
        <MonthDropdown
          month={month}
          months={months}
          onSelect={handleMonthChange}
        />
        <YearDropdown
          year={year}
          years={years}
          onSelect={handleYearChange}
        />
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

