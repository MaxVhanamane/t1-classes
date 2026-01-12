"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, FormProvider, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, Loader } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";

import { batchSchema } from "../zod-schema/schema";
import { BatchDialogProps, BatchListItem } from "../types/types";
import { createBatch } from "../actions/create-batch";
import { updateBatch } from "../actions/update-batch";
import { BatchHighlightsEditor } from "./batch-highlight-editor";
import { getBatchEditState } from "../actions/get-batch-edit-state";
import { cn } from "@/src/lib/utils";

const LANGUAGES = ["english", "hindi", "marathi"] as const;

/* ---------------- helpers ---------------- */

function toDateInput(v?: string | null) {
  return v ? v.slice(0, 10) : "";
}

function fromDateInput(v?: string | null) {
  return v ? v : null;
}

/* ---------------- component ---------------- */

export function BatchDialog({
  open,
  onOpenChange,
  batch,
  courses,
}: BatchDialogProps) {
  const [editLocked, setEditLocked] = useState<boolean>(false);
  const [checkingLock, setCheckingLock] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      course_ids: [],
      name: "",
      description: null,
      batch_highlights: null,
      price: 0,
      languages: ["english"],
      center_name: null,
      admission_open: true,
      mode: "offline",
      status: "upcoming",
      is_active: true,
      start_date: null,
      end_date: null,
      duration: null,
      capacity: null,
      schedule: null,
      meeting_link: null,
    },
  });

  /* ---------------- watched values ---------------- */

  const courseIds = useWatch({
    control: form.control,
    name: "course_ids",
  });

  const languages = useWatch({
    control: form.control,
    name: "languages",
  });

  const mode = useWatch({
    control: form.control,
    name: "mode",
  });

  const status = useWatch({
    control: form.control,
    name: "status",
  });

  const isActive = useWatch({
    control: form.control,
    name: "is_active",
  });

  const admissionOpen = useWatch({
    control: form.control,
    name: "admission_open",
  });

  const durationValue = useWatch({
    control: form.control,
    name: "duration",
  });

  const durationMode: "dates" | "duration" =
    durationValue != null ? "duration" : "dates";

  /* ---------------- reset on open ---------------- */
  useEffect(() => {
    if (!open) return;

    if (batch) {
      form.reset({
        course_ids: batch.courses.map((c) => c.course.id),
        name: batch.name,
        description: batch.description,
        batch_highlights: batch.batch_highlights,
        price: batch.price,
        languages: batch.languages.length ? batch.languages : ["english"],
        center_name: batch.center_name,
        admission_open: batch.admission_open,
        mode: batch.mode,
        status: batch.status,
        is_active: batch.is_active,
        start_date: toDateInput(batch.start_date),
        end_date: toDateInput(batch.end_date),
        duration: batch.duration,
        capacity: batch.capacity,
        schedule: batch.schedule,
        meeting_link: null,
      });
    } else {
      form.reset();
    }
  }, [open, batch, form]);

  useEffect(() => {
    if (!open) {
      setEditLocked(false);
      setCheckingLock(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!batch) {
      setEditLocked(false);
      return;
    }
    const batchId = batch.id;
    let cancelled = false;

    async function checkLock() {
      try {
        setCheckingLock(true);
        const res = await getBatchEditState(batchId);
        if (!cancelled) {
          setEditLocked(res.locked);
        }
      } catch {
        // fail-safe: lock editing
        if (!cancelled) setEditLocked(true);
      } finally {
        if (!cancelled) setCheckingLock(false);
      }
    }
    //I know this returns a promise, and I am intentionally not awaiting it
    void checkLock();

    return () => {
      cancelled = true;
    };
  }, [open, batch]);

  /* ---------------- duration cleanup ---------------- */

  useEffect(() => {
    if (durationMode === "dates") {
      form.setValue("duration", null);
    } else {
      form.setValue("start_date", null);
      form.setValue("end_date", null);
    }
  }, [durationMode, form]);

  function extractFirstErrorMessage(errors: FieldErrors): string | null {
    for (const key in errors) {
      const value = errors[key];

      if (!value) continue;

      if ("message" in value && typeof value.message === "string") {
        return value.message;
      }

      if (typeof value === "object") {
        const nested = extractFirstErrorMessage(value as FieldErrors);
        if (nested) return nested;
      }
    }

    return null;
  }

  /* ---------------- submit ---------------- */

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        const payload = {
          ...values,
          start_date: fromDateInput(values.start_date),
          end_date: fromDateInput(values.end_date),
        };

        if (batch) {
          await updateBatch(batch.id, payload);
          toast.success("Batch updated");
        } else {
          await createBatch(payload);
          toast.success("Batch created");
        }

        onOpenChange(false);
        form.reset();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong";
        toast.error(message);
      }
    },
    (errors) => {
      const message = extractFirstErrorMessage(errors);
      toast.error(message ?? "Please fix the form errors");
    }
  );

  /* ---------------- render ---------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{batch ? "Edit Batch" : "Create Batch"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* COURSES */}
            <div className="space-y-2">
              <Label>Courses</Label>

              <Collapsible>
                <CollapsibleTrigger
                  asChild
                  disabled={editLocked || checkingLock}
                >
                  <button
                    disabled={editLocked || checkingLock}
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                      editLocked || checkingLock
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : "hover:bg-muted cursor-pointer"
                    )}
                  >
                    <span className="truncate">
                      {courseIds.length === 0
                        ? "Select courses"
                        : courseIds.length === 1
                        ? courses.find((c) => c.id === courseIds[0])?.title
                        : `${courseIds.length} courses selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 border rounded-md p-3 space-y-2 max-h-56 overflow-y-auto">
                  {courses.map((c) => {
                    const checked = courseIds.includes(c.id);
                    const disabled = editLocked || !c.is_active;

                    return (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-center gap-2",
                          !c.is_active && "opacity-60"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={(v) => {
                            if (disabled) return;

                            const next = v
                              ? [...courseIds, c.id]
                              : courseIds.filter((id) => id !== c.id);

                            form.setValue("course_ids", next);
                          }}
                        />

                        <span className="text-sm">
                          {c.title}
                          {!c.is_active && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (inactive)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              {checkingLock && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" /> Checking
                  enrollment status…
                </p>
              )}

              {!editLocked && !checkingLock && (
                <p className="text-xs text-muted-foreground">
                  Select one or more courses included in this batch
                </p>
              )}
              {editLocked && (
                <p className="text-xs text-amber-600">
                  Students are already enrolled in this batch. Courses cannot be
                  added or removed once enrollment has started.
                </p>
              )}
            </div>

            {/* NAME */}
            <div className="space-y-1">
              <Label>Batch Name</Label>
              <Input {...form.register("name")} />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Shown to students (optional)"
                {...form.register("description")}
              />
            </div>

            {/* HIGHLIGHTS */}
            <BatchHighlightsEditor />

            {/* PRICE */}
            <div className="space-y-1">
              <Label>Batch Price (₹)</Label>
              <Input
                type="number"
                min={0}
                {...form.register("price", {
                  valueAsNumber: true,
                })}
              />
            </div>

            {/* CENTER */}
            <div className="space-y-1">
              <Label>Center</Label>
              <Input
                placeholder="e.g. Solapur, Pune - Wakad"
                {...form.register("center_name")}
              />
            </div>

            {/* LANGUAGES */}
            <div className="space-y-2">
              <Label>Teaching Languages</Label>
              <div className="flex gap-4">
                {LANGUAGES.map((lang) => (
                  <div key={lang} className="flex items-center gap-2">
                    <Checkbox
                      checked={languages.includes(lang)}
                      onCheckedChange={(v) => {
                        const next = v
                          ? [...languages, lang]
                          : languages.filter((l) => l !== lang);
                        form.setValue("languages", next);
                      }}
                    />
                    <span className="capitalize">{lang}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMISSION */}
            <div className="flex items-center justify-between">
              <Label>Admission Open</Label>
              <Switch
                checked={admissionOpen}
                onCheckedChange={(v) => form.setValue("admission_open", v)}
              />
            </div>

            {/* MODE */}
            <div className="space-y-1">
              <Label>Batch Mode</Label>
              <Select
                value={mode}
                onValueChange={(v) =>
                  form.setValue("mode", v as BatchListItem["mode"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode !== "offline" && (
              <div className="space-y-1">
                <Label>Meeting Link</Label>
                <Input {...form.register("meeting_link")} />
              </div>
            )}

            {/* DURATION */}
            <div className="space-y-3">
              <Label>Batch Duration</Label>

              <div className="flex gap-2">
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant={durationMode === "dates" ? "default" : "outline"}
                  onClick={() => form.setValue("duration", null)}
                >
                  Fixed Dates
                </Button>

                <span className="self-center text-muted-foreground">OR</span>

                <Button
                  className="cursor-pointer"
                  type="button"
                  variant={durationMode === "duration" ? "default" : "outline"}
                  onClick={() => {
                    form.setValue("start_date", null);
                    form.setValue("end_date", null);
                    form.setValue("duration", 1);
                  }}
                >
                  Duration (months)
                </Button>
              </div>

              {durationMode === "dates" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Start Date</Label>
                    <Input type="date" {...form.register("start_date")} />
                  </div>
                  <div className="space-y-1">
                    <Label>End Date</Label>
                    <Input type="date" {...form.register("end_date")} />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Duration (months)</Label>
                  <Input
                    type="number"
                    {...form.register("duration", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              )}
            </div>

            {/* CAPACITY */}
            <div className="space-y-1">
              <Label>Capacity</Label>
              <Input
                type="number"
                {...form.register("capacity", {
                  valueAsNumber: true,
                })}
              />
            </div>

            {/* STATUS */}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  form.setValue("status", v as BatchListItem["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ACTIVE */}
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => form.setValue("is_active", v)}
              />
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full cursor-pointer "
            >
              {form.formState.isSubmitting
                ? batch
                  ? "Updating..."
                  : "Creating..."
                : batch
                ? "Update Batch"
                : "Create Batch"}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
