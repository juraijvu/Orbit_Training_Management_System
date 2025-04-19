import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  trigger?: React.ReactNode;
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "Select date",
  disabled = false,
  align = "start",
  trigger,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : placeholder}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}