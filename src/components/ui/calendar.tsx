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
  // Extract onSelect from props to avoid conflicts
  const { onSelect: propsOnSelect, ...restProps } = props as any;
  // Initialize month/year from selected date or current date
  const getInitialMonth = () => {
    if ('selected' in props && props.selected && props.selected instanceof Date) {
      return props.selected.getMonth();
    }
    if (props.month) {
      return props.month.getMonth();
    }
    return new Date().getMonth();
  };

  const getInitialYear = () => {
    if ('selected' in props && props.selected && props.selected instanceof Date) {
      return props.selected.getFullYear();
    }
    if (props.month) {
      return props.month.getFullYear();
    }
    return new Date().getFullYear();
  };

  const [month, setMonth] = React.useState<number>(getInitialMonth());
  const [year, setYear] = React.useState<number>(getInitialYear());
  // Track if user has manually changed month/year to prioritize local state
  const [userChangedView, setUserChangedView] = React.useState(false);
  
  // Generate year range dynamically - always include wide range to allow navigation to any future year
  // The range expands dynamically as user navigates to new years
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    // Get all relevant years: current view year, selected date year, current year
    const relevantYears = [currentYear, year];
    
    if ('selected' in props && props.selected && props.selected instanceof Date) {
      relevantYears.push(props.selected.getFullYear());
    }
    if (props.month) {
      relevantYears.push(props.month.getFullYear());
    }
    
    // Always include a wide range: from 10 years before the earliest to 50 years after the latest
    // This ensures users can always navigate to future years from any starting point
    const minYear = Math.min(...relevantYears) - 10;
    const maxYear = Math.max(...relevantYears) + 50;
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  }, ['selected' in props ? props.selected : null, props.month, year]);
  
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
    setUserChangedView(true);
    const newDate = new Date(year, newMonth, 1);
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };
  
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setUserChangedView(true);
    const newDate = new Date(newYear, month, 1);
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };
  
  // Update month/year when selected date or month prop changes
  // BUT only if user hasn't manually changed the view (to prevent resetting user's year selection)
  React.useEffect(() => {
    // Don't override user's manual changes - only sync if user hasn't changed the view
    if (userChangedView) {
      return; // User has manually changed year/month, don't reset it
    }
    
    if ('selected' in props && props.selected && props.selected instanceof Date) {
      const selectedMonth = props.selected.getMonth();
      const selectedYear = props.selected.getFullYear();
      if (month !== selectedMonth || year !== selectedYear) {
        setMonth(selectedMonth);
        setYear(selectedYear);
      }
    } else if (props.month) {
      const propMonth = props.month.getMonth();
      const propYear = props.month.getFullYear();
      if (month !== propMonth || year !== propYear) {
        setMonth(propMonth);
        setYear(propYear);
      }
    }
  }, ['selected' in props ? props.selected : null, props.month, userChangedView, month, year]);

  // Ensure month prop is always in sync with local state
  const currentMonth = React.useMemo(() => {
    return new Date(year, month, 1);
  }, [year, month]);

  // Determine which month to use - prioritize local state if user changed view
  const displayMonth = React.useMemo(() => {
    if (userChangedView) {
      return currentMonth;
    }
    return props.month || currentMonth;
  }, [props.month, currentMonth, userChangedView]);

  // Intercept onSelect to ensure the correct date is selected
  // CRITICAL FIX: react-day-picker may pass dates with incorrect year/month
  // SOLUTION: Always use the CURRENT VIEW's year and month (from our internal state)
  // and only use the day from the selectedDate. This guarantees we use the year/month
  // that the user is actually viewing, not what react-day-picker thinks it is.
  const handleSelect = React.useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Extract the day from the selected date
      const selectedDay = selectedDate.getDate();
      
      // CRITICAL FIX: Always use the current view's year and month
      // The user navigated to a specific year/month (e.g., April 2026), so we MUST use that
      // react-day-picker might pass a date with the wrong year/month, but we know what
      // the user is viewing, so we use that instead
      const viewYear = year;
      const viewMonth = month; // 0-11
      
      // Check if the selected date is from an adjacent month (previous/next month days shown in calendar)
      const selectedDateMonth = selectedDate.getMonth();
      const selectedDateYear = selectedDate.getFullYear();
      const isAdjacentMonth = selectedDateMonth !== viewMonth || selectedDateYear !== viewYear;
      
      let finalYear = viewYear;
      let finalMonth = viewMonth;
      
      // Only adjust if it's clearly an adjacent month day (within 1 month difference)
      if (isAdjacentMonth) {
        const monthDiff = selectedDateMonth - viewMonth;
        
        // Handle year rollover cases
        if (monthDiff === 11 && viewMonth === 0) {
          // Selected is December, view is January - use previous year, December
          finalYear = viewYear - 1;
          finalMonth = 11;
        } else if (monthDiff === -11 && viewMonth === 11) {
          // Selected is January, view is December - use next year, January
          finalYear = viewYear + 1;
          finalMonth = 0;
        } else if (Math.abs(monthDiff) === 1) {
          // Adjacent month within same year
          finalMonth = selectedDateMonth;
          finalYear = viewYear;
        }
        // Otherwise, use the view's year/month (the selected date's year/month is wrong)
      }
      
      // Create a new date object using the determined year, month, and the selected day
      // Set time to noon to avoid any edge cases with midnight timezone conversions
      const correctedDate = new Date(finalYear, finalMonth, selectedDay, 12, 0, 0, 0);
      
      // Verify the corrected date matches what we intended
      const verifyYear = correctedDate.getFullYear();
      const verifyMonth = correctedDate.getMonth();
      const verifyDay = correctedDate.getDate();
      
      if (verifyYear !== finalYear || 
          verifyMonth !== finalMonth || 
          verifyDay !== selectedDay) {
        console.error('Calendar: Date construction error!', {
          intended: { year: finalYear, month: finalMonth + 1, day: selectedDay },
          actual: { year: verifyYear, month: verifyMonth + 1, day: verifyDay },
          viewState: { year: viewYear, month: viewMonth + 1 },
          reactDayPickerDate: { 
            year: selectedDateYear, 
            month: selectedDateMonth + 1, 
            day: selectedDay 
          }
        });
      }
      
      // Update the view to match the selected date (if it's from an adjacent month)
      if (finalYear !== year || finalMonth !== month) {
        setYear(finalYear);
        setMonth(finalMonth);
      }
      
      // Reset userChangedView flag after selection
      setUserChangedView(false);
      
      propsOnSelect?.(correctedDate);
    } else {
      propsOnSelect?.(selectedDate);
    }
  }, [propsOnSelect, year, month]);

  return (
    <div className={cn("relative", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        captionLayout="dropdown"
        month={displayMonth}
        onMonthChange={(date) => {
          const newMonth = date.getMonth();
          const newYear = date.getFullYear();
          // Only update if different to avoid unnecessary re-renders
          if (month !== newMonth) setMonth(newMonth);
          if (year !== newYear) setYear(newYear);
          props.onMonthChange?.(date);
        }}
        onSelect={handleSelect as any}
        className="p-4"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-between items-center pt-1 mb-4 px-2 py-2 rounded-lg bg-zinc-800/50 dark:bg-zinc-800/50 relative",
          caption_label: "hidden",
          caption_dropdowns: "flex items-center gap-2 absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none",
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
      {...restProps}
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

