"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { differenceInMinutes, isBefore, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { toast } from "sonner";

import { extendDistribution } from "../actions/extend-distribution";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  distributionId: string;
  currentEndsAt: string;
}

interface FormValues {
  date: Date;
  time: string; // HH:mm
}

/* ---------------- Helpers ---------------- */

function formatDelta(totalMinutes: number) {
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

  return parts.join(" ");
}

/* ---------------- Component ---------------- */

export function ExtendDistributionDialog({
  open,
  onOpenChange,
  distributionId,
  currentEndsAt,
}: Props) {
  const currentEndDate = useMemo(
    () => new Date(currentEndsAt),
    [currentEndsAt]
  );

  const form = useForm<FormValues>({
    defaultValues: {
      date: currentEndDate,
      time: currentEndDate.toTimeString().slice(0, 5),
    },
  });

  const selectedDate = useWatch({
    control: form.control,
    name: "date",
  });

  const selectedTime = useWatch({
    control: form.control,
    name: "time",
  });

  /* ---------------- Reset On Close ---------------- */
  useEffect(() => {
    if (!open) {
      form.reset({
        date: currentEndDate,
        time: currentEndDate.toTimeString().slice(0, 5),
      });
    }
  }, [open, currentEndDate, form]);

  /* ---------------- Compute Preview ---------------- */
  const extensionPreview = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;

    const [h, m] = selectedTime.split(":").map(Number);
    const newEnd = new Date(selectedDate);
    newEnd.setHours(h, m, 0, 0);

    if (isBefore(newEnd, currentEndDate)) return null;

    const diffMinutes = differenceInMinutes(newEnd, currentEndDate);

    return diffMinutes > 0 ? formatDelta(diffMinutes) : null;
  }, [selectedDate, selectedTime, currentEndDate]);

  /* ---------------- Submit ---------------- */
  async function onSubmit(values: FormValues) {
    const [h, m] = values.time.split(":").map(Number);
    const newEnd = new Date(values.date);
    newEnd.setHours(h, m, 0, 0);

    if (isBefore(newEnd, currentEndDate)) {
      toast.error("New end time must be after the current end time");
      return;
    }

    try {
      await extendDistribution(distributionId, newEnd.toISOString());
      toast.success("Test duration extended");
      onOpenChange(false);
    } catch {
      toast.error("Failed to extend test");
    }
  }

  /* ---------------- Render ---------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Test Time</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New End Date</label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 font-normal"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate
                    ? selectedDate.toLocaleDateString()
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      form.setValue("date", d);
                    }
                  }}
                  disabled={(date) =>
                    isBefore(date, startOfDay(currentEndDate))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New End Time</label>
            <Input type="time" {...form.register("time")} />
          </div>

          {/* Preview */}
          {extensionPreview && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              Extending by{" "}
              <span className="font-medium">{extensionPreview}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">Extend Test</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
