"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { differenceInMinutes, format, isBefore } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { extendDistribution } from "../actions/extend-distribution";
import { ISODatePicker } from "./iso-date-picker";
import { dateToISO } from "../../../schedule/_features/components/schedule-test-dialog";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  distributionId: string;
  currentEndsAt: string;
}

interface FormValues {
  ends_at: string;
}

/* ---------- helper ---------- */

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

export function ExtendDistributionDialog({
  open,
  onOpenChange,
  distributionId,
  currentEndsAt,
}: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      ends_at: dateToISO(new Date(currentEndsAt)),
    },
  });

  const endsAt = useWatch({
    control: form.control,
    name: "ends_at",
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const extensionPreview = useMemo(() => {
    if (!endsAt) return null;

    const current = new Date(currentEndsAt);
    const next = new Date(endsAt);

    if (isBefore(next, current)) return null;

    const diff = differenceInMinutes(next, current);
    return diff > 0 ? formatDelta(diff) : null;
  }, [endsAt, currentEndsAt]);

  async function onSubmit(values: FormValues) {
    const newEnd = new Date(values.ends_at);
    const current = new Date(currentEndsAt);

    if (isBefore(newEnd, current)) {
      const formattedCurrent = format(current, "PPP p");
      toast.error(
        `New end time must be after the current end time (${formattedCurrent})`,
      );
      return;
    }

    if (newEnd.getTime() === current.getTime()) {
      toast.message(
        "The selected end time is the same as the current end time.",
      );
      return;
    }

    const { error } = await callServerAction(
      extendDistribution(distributionId, values.ends_at),
    );

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Test duration extended");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Test Time</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ISODatePicker
            label="New End Time"
            value={endsAt}
            onChange={(v) =>
              form.setValue("ends_at", v, { shouldValidate: true })
            }
          />

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
