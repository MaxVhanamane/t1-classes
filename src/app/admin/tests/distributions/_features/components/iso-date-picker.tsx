/* ---------------- ISO Date Picker ---------------- */

import { cn } from "@/src/lib/utils";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";

/* ---------------- Helpers ---------------- */

function dateToISO(date: Date) {
  date.setSeconds(0, 0);
  return date.toISOString();
}

function isoToDate(value?: string | null) {
  return value ? new Date(value) : undefined;
}

export function ISODatePicker({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const date = isoToDate(value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP p") : "Pick date & time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="bottom"
          sideOffset={0}
          avoidCollisions={false}
          className="w-[320px] p-3 space-y-3 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (!d) return;

              const next = date ? new Date(date) : new Date();

              next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
              next.setSeconds(0, 0);

              onChange(dateToISO(next));
            }}
          />

          <Input
            type="time"
            disabled={disabled}
            onFocus={(e) => {
              (e.target as HTMLInputElement).showPicker?.();
            }}
            value={
              date
                ? `${String(date.getHours()).padStart(2, "0")}:${String(
                    date.getMinutes(),
                  ).padStart(2, "0")}`
                : ""
            }
            onChange={(e) => {
              if (!date) return;

              const [h, m] = e.target.value.split(":");

              const next = new Date(date);

              next.setHours(Number(h), Number(m), 0, 0);

              onChange(dateToISO(next));
            }}
          />

          <div className="flex justify-end">
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
