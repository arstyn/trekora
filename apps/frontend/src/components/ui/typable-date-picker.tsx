import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Matcher } from "react-day-picker";

export interface TypableDatePickerProps {
  value?: string; // Expects "YYYY-MM-DD" or "DD-MM-YYYY" or empty string
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  min?: string;
  max?: string;
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years";
  required?: boolean;
  disabledDates?: Matcher | Matcher[];
}

export function parseDateString(str: string | undefined): Date | null {
  if (!str || !str.trim()) return null;
  const s = str.trim();

  // Strict match for DD-MM-YYYY or DD/MM/YYYY (4-digit year required)
  const ddmmyyyyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);

    if (year < 1900 || year > 2100) return null;
    if (month < 0 || month > 11) return null;
    if (day < 1 || day > 31) return null;

    const date = new Date(year, month, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
    return null;
  }

  // Strict match for YYYY-MM-DD or YYYY/MM/DD (4-digit year required)
  const yyyymmddMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = parseInt(yyyymmddMatch[3], 10);

    if (year < 1900 || year > 2100) return null;
    if (month < 0 || month > 11) return null;
    if (day < 1 || day > 31) return null;

    const date = new Date(year, month, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
    return null;
  }

  return null;
}

export function formatDateToDisplay(date: Date): string {
  return format(date, "dd-MM-yyyy");
}

export function formatDateToYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatRawDateInput(val: string, isDeleting: boolean = false): string {
  // Extract only digits up to 8 max (DDMMYYYY)
  const digits = val.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";

  let day = digits.slice(0, 2);
  let month = digits.slice(2, 4);
  let year = digits.slice(4, 8);

  // Validate day number (1-31)
  if (day.length === 2) {
    const dNum = parseInt(day, 10);
    if (dNum > 31) day = "31";
    else if (dNum === 0) day = "01";
  }

  // Validate month number (1-12)
  if (month.length === 2) {
    const mNum = parseInt(month, 10);
    if (mNum > 12) month = "12";
    else if (mNum === 0) month = "01";
  }

  let result = day;
  if (digits.length > 2 || (digits.length === 2 && !isDeleting)) {
    result += "-" + month;
  } else if (month.length > 0) {
    result += "-" + month;
  }

  if (digits.length > 4 || (digits.length === 4 && !isDeleting)) {
    result += "-" + year;
  } else if (year.length > 0) {
    result += "-" + year;
  }

  return result;
}

export function TypableDatePicker({
  value = "",
  onChange,
  placeholder = "DD-MM-YYYY",
  disabled = false,
  className,
  id,
  name,
  min,
  max,
  captionLayout = "dropdown",
  required = false,
  disabledDates,
}: TypableDatePickerProps) {
  const isFocusedRef = React.useRef(false);

  // Format display value to DD-MM-YYYY if valid date
  const getDisplayValue = React.useCallback((val: string) => {
    if (!val) return "";
    const parsed = parseDateString(val);
    return parsed ? formatDateToDisplay(parsed) : val;
  }, []);

  const [inputValue, setInputValue] = React.useState<string>(() =>
    getDisplayValue(value)
  );
  const [open, setOpen] = React.useState<boolean>(false);

  // Sync internal inputValue with external value prop when input is NOT focused
  React.useEffect(() => {
    if (isFocusedRef.current) return;
    setInputValue(getDisplayValue(value));
  }, [value, getDisplayValue]);

  const parsedSelectedDate = React.useMemo(() => {
    return parseDateString(inputValue);
  }, [inputValue]);

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const nativeEvent = e.nativeEvent as InputEvent;
    const isDeleting =
      nativeEvent?.inputType?.startsWith("delete") ||
      rawVal.length < inputValue.length;

    const maskedVal = formatRawDateInput(rawVal, isDeleting);
    setInputValue(maskedVal);

    if (!maskedVal.trim()) {
      onChange?.("");
      return;
    }

    const parsed = parseDateString(maskedVal);
    if (parsed) {
      const outputValue = formatDateToYYYYMMDD(parsed);
      onChange?.(outputValue);
    }
  };

  const handleInputBlur = () => {
    isFocusedRef.current = false;

    if (!inputValue.trim()) {
      onChange?.("");
      return;
    }

    const parsed = parseDateString(inputValue);
    if (parsed) {
      const displayVal = formatDateToDisplay(parsed);
      const outputVal = formatDateToYYYYMMDD(parsed);
      setInputValue(displayVal);
      onChange?.(outputVal);
    } else {
      // Revert invalid date entry back to prop value or empty
      const prevParsed = parseDateString(value);
      if (prevParsed) {
        setInputValue(formatDateToDisplay(prevParsed));
      } else {
        setInputValue("");
        onChange?.("");
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const displayVal = formatDateToDisplay(date);
      const outputVal = formatDateToYYYYMMDD(date);
      setInputValue(displayVal);
      onChange?.(outputVal);
      setOpen(false);
    }
  };

  // Construct disabled matchers if min/max provided
  const combinedDisabled = React.useMemo(() => {
    const matchers: Matcher[] = [];
    if (disabledDates) {
      if (Array.isArray(disabledDates)) {
        matchers.push(...disabledDates);
      } else {
        matchers.push(disabledDates);
      }
    }
    if (min) {
      const minDate = parseDateString(min);
      if (minDate) matchers.push({ before: minDate });
    }
    if (max) {
      const maxDate = parseDateString(max);
      if (maxDate) matchers.push({ after: maxDate });
    }
    return matchers.length > 0 ? matchers : undefined;
  }, [disabledDates, min, max]);

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Input
        id={id}
        name={name}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onFocus={handleFocus}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        required={required}
        maxLength={10}
        className="pr-10 h-9 text-sm"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            tabIndex={-1}
            className="absolute right-0 top-0 h-full px-2.5 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            captionLayout={captionLayout}
            selected={parsedSelectedDate || undefined}
            defaultMonth={parsedSelectedDate || new Date()}
            onSelect={handleCalendarSelect}
            disabled={combinedDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
