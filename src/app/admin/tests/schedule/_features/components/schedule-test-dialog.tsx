"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { toast } from "sonner";

import { createTestDistribution } from "../actions/create-test-distribution";

import {
  ScheduleTestInput,
  scheduleTestSchema,
} from "../zod/schedule-test.schema";

import { BatchRow } from "../types/audience.types";
import { updateTestDistribution } from "../../../distributions/_features/actions/update-test-distribution";
import { ISODatePicker } from "../../../distributions/_features/components/iso-date-picker";
import { useRouter } from "nextjs-toploader/app";
import { callServerAction } from "@/src/lib/actions/call-server-action";

/* ---------------- Types ---------------- */
export function dateToISO(date: Date) {
  date.setSeconds(0, 0);
  return date.toISOString();
}

interface Props {
  testId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  distribution?: {
    id: string;
    batch_id: string;
    starts_at: string;
    ends_at: string;
    duration_minutes: number;
  };
}

/* ---------------- Component ---------------- */

export function ScheduleTestDialog({
  testId,
  open,
  onOpenChange,
  distribution,
}: Props) {
  const isEditMode = !!distribution;
  const router = useRouter();
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<ScheduleTestInput>({
    resolver: zodResolver(scheduleTestSchema),
    defaultValues: {
      test_id: testId,
      batch_id: "",
      starts_at: "",
      ends_at: "",
      duration_minutes: 60,
    },
  });

  const startsAt = useWatch({
    control: form.control,
    name: "starts_at",
  });

  const endsAt = useWatch({
    control: form.control,
    name: "ends_at",
  });

  const isSubmitting = form.formState.isSubmitting;

  /* ---------------- Load Batches ---------------- */

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await fetch("/api/admin/schedule/batches");

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error();
        }

        const data: BatchRow[] = await res.json();
        setBatches(data);
      } catch {
        toast.error("Failed to load batches");
      } finally {
        setLoading(false);
      }
    }

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* ---------------- Populate Edit Mode ---------------- */

  useEffect(() => {
    if (open && distribution) {
      form.reset({
        test_id: testId,
        batch_id: distribution.batch_id,
        starts_at: dateToISO(new Date(distribution.starts_at)),
        ends_at: dateToISO(new Date(distribution.ends_at)),
        duration_minutes: distribution.duration_minutes,
      });
    }

    if (!open && !distribution) {
      form.reset();
    }
  }, [open, distribution, testId, form]);

  /* ---------------- Submit ---------------- */

  async function onSubmit(values: ScheduleTestInput) {
    try {
      const start = new Date(values.starts_at);
      const end = new Date(values.ends_at);

      if (!values.batch_id) {
        toast.error("Please select a batch");
        return;
      }

      if (end <= start) {
        toast.error("End time must be after start time");
        return;
      }

      if (start < new Date()) {
        toast.error("Cannot schedule a test in the past");
        return;
      }

      const windowMinutes = (end.getTime() - start.getTime()) / 60000;

      if (values.duration_minutes > windowMinutes) {
        toast.error("Duration cannot exceed the test window");
        return;
      }

      if (isEditMode && distribution) {
        const { error } = await callServerAction(
          updateTestDistribution(distribution.id, values),
        );

        if (error) {
          handleDistributionError(error);
          return;
        }

        toast.success("Distribution updated");
      } else {
        const { error } = await callServerAction(
          createTestDistribution(values),
        );

        if (error) {
          handleDistributionError(error);
          return;
        }

        toast.success("Test scheduled");
      }

      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-lg max-h-[95vh] overflow-y-scroll"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Scheduled Test" : "Schedule Test"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          aria-busy={isSubmitting}
        >
          {/* Batch */}

          <div className="space-y-1">
            <Label>Batch</Label>

            <Controller
              control={form.control}
              name="batch_id"
              render={({ field }) => (
                <Select
                  disabled={loading || isSubmitting}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loading ? "Loading batches..." : "Select batch"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Start Time */}

          <ISODatePicker
            label="Start time"
            value={startsAt}
            onChange={(v) =>
              form.setValue("starts_at", v, { shouldValidate: true })
            }
            disabled={isSubmitting}
          />

          {/* End Time */}

          <ISODatePicker
            label="End time"
            value={endsAt}
            onChange={(v) =>
              form.setValue("ends_at", v, { shouldValidate: true })
            }
            disabled={isSubmitting}
          />

          {/* Duration */}

          <div className="space-y-1">
            <Label>Duration (minutes)</Label>

            <Input
              disabled={isSubmitting}
              type="number"
              min={1}
              {...form.register("duration_minutes", {
                valueAsNumber: true,
              })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEditMode
                ? isSubmitting
                  ? "Saving..."
                  : "Save"
                : isSubmitting
                  ? "Scheduling..."
                  : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function handleDistributionError(error: unknown) {
  if (typeof error === "string") {
    try {
      const parsed = JSON.parse(error);

      if (parsed.code === "TEST_GAP_CONFLICT") {
        const start = new Date(parsed.starts_at).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const end = new Date(parsed.ends_at).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        toast.error(
          `Cannot schedule this test. It conflicts with "${parsed.title}" scheduled from ${start} to ${end}. A minimum 30-minute gap between tests is required.`,
          { duration: 15000 },
        );

        return;
      }
    } catch {
      // not JSON, continue
    }

    toast.error(error);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error("Failed to save distribution");
}
