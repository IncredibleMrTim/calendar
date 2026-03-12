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
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  "data-invalid"?: boolean;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onSelect,
  placeholder = "Pick a date",
  id,
  "data-invalid": invalid,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            invalid && "border-destructive",
          )}
          data-invalid={invalid}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
