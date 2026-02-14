"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

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
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

import { createTestDistribution } from "../actions/create-test-distribution";
import { getCourses } from "../actions/get-courses-for-schedule";
import { getBatches } from "../actions/get-batches-for-schedule";

import {
  ScheduleTestInput,
  scheduleTestSchema,
} from "../zod/schedule-test.schema";

import { CourseRow, BatchRow } from "../types/audience.types";
import { DistributionAudience } from "../types/test-distribution.types";
import { updateTestDistribution } from "../../../distributions/_features/actions/update-test-distribution";

/* ---------------- Types ---------------- */

interface Props {
  testId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;

  distribution?: {
    id: string;
    audience: DistributionAudience;
    batch_id: string | null;
    course_id: string | null;
    starts_at: string;
    ends_at: string;
    duration_minutes: number;
    max_attempts: number;
  };
}

/* ---------------- Helpers ---------------- */

function dateToISO(date: Date) {
  return date.toISOString();
}

function isoToDate(value?: string | null) {
  return value ? new Date(value) : undefined;
}

/* ---------------- Component ---------------- */

export function ScheduleTestDialog({
  testId,
  open,
  onOpenChange,
  distribution,
}: Props) {
  const isEditMode = !!distribution;

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<ScheduleTestInput>({
    resolver: zodResolver(scheduleTestSchema),
    defaultValues: {
      test_id: testId,
      audience: "batch",
      batch_id: null,
      course_id: null,
      starts_at: "",
      ends_at: "",
      duration_minutes: 60,
      max_attempts: 1,
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const audience = form.watch("audience");

  /* ---------------- Load Audience Data ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const [c, b] = await Promise.all([getCourses(), getBatches()]);
        setCourses(c);
        setBatches(b);
      } catch {
        toast.error("Failed to load courses or batches");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  /* ---------------- Populate Form (Edit Mode) ---------------- */
  useEffect(() => {
    if (open && distribution) {
      form.reset({
        test_id: testId,
        audience: distribution.audience,
        batch_id: distribution.batch_id,
        course_id: distribution.course_id,
        starts_at: distribution.starts_at,
        ends_at: distribution.ends_at,
        duration_minutes: distribution.duration_minutes,
        max_attempts: distribution.max_attempts,
      });
    }

    if (!open && !distribution) {
      form.reset();
    }
  }, [open, distribution, testId, form]);

  /* ---------------- Submit ---------------- */
  async function onSubmit(values: ScheduleTestInput) {
    try {
      if (isEditMode && distribution) {
        await updateTestDistribution(distribution.id, values);
        toast.success("Distribution updated");
      } else {
        await createTestDistribution(values);
        toast.success("Test scheduled");
      }

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save distribution");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
          {/* Audience */}
          <div className="space-y-1">
            <Label>Audience</Label>

            <Controller
              control={form.control}
              name="audience"
              render={({ field }) => (
                <Select
                  disabled={isSubmitting}
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v as DistributionAudience);
                    form.setValue("batch_id", null, { shouldValidate: true });
                    form.setValue("course_id", null, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="batch">Batch</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Batch */}
          {audience === "batch" && (
            <div className="space-y-1">
              <Label>Batch</Label>

              <Controller
                control={form.control}
                name="batch_id"
                render={({ field }) => (
                  <Select
                    disabled={loading || isSubmitting}
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v === "" ? null : v)}
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
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Course */}
          {audience === "course" && (
            <div className="space-y-1">
              <Label>Course</Label>

              <Controller
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <Select
                    disabled={loading || isSubmitting}
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v === "" ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loading ? "Loading courses..." : "Select course"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Start */}
          <ISODatePicker
            label="Start time"
            value={form.watch("starts_at")}
            onChange={(v) =>
              form.setValue("starts_at", v, { shouldValidate: true })
            }
            disabled={isSubmitting}
          />

          {/* End */}
          <ISODatePicker
            label="End time"
            value={form.watch("ends_at")}
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

          {/* Attempts */}
          <div className="space-y-1">
            <Label>Max Attempts</Label>
            <Input
              disabled={isSubmitting}
              type="number"
              min={1}
              {...form.register("max_attempts", {
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

/* ---------------- ISO Date Picker ---------------- */

function ISODatePicker({
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
  const date = isoToDate(value);

  return (
    <div className="space-y-1">
      <Label>{label}</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="outline"
            className={cn(
              "w-full justify-start text-left",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP p") : "Pick date & time"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3 space-y-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (!d) return;
              onChange(dateToISO(d));
            }}
            initialFocus
          />

          <Input
            disabled={disabled}
            type="time"
            onChange={(e) => {
              if (!date) return;
              const [h, m] = e.target.value.split(":");
              const next = new Date(date);
              next.setHours(Number(h), Number(m));
              onChange(dateToISO(next));
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
