"use client";

import { useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { batchSchema } from "../zod-schema/schema";
import { createBatch, updateBatch } from "../actions/actions";
import { BatchListItem } from "../types/types";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Textarea } from "@/src/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch?: BatchListItem;
  courses: { id: string; title: string }[];
};
const LANGUAGES = ["english", "hindi", "marathi"] as const;
function toDateInput(v?: string | null) {
  return v ? v.slice(0, 10) : "";
}

function fromDateInput(v?: string | null) {
  return v ? v : null;
}

export function BatchDialog({ open, onOpenChange, batch, courses }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      course_id: "",
      name: "",
      description: null,
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

  const mode = useWatch({
    control: form.control,
    name: "mode",
  });

  const languages = useWatch({
    control: form.control,
    name: "languages",
  });

  const courseId = useWatch({
    control: form.control,
    name: "course_id",
  });
  const admissionOpen = useWatch({
    control: form.control,
    name: "admission_open",
  });

  const status = useWatch({
    control: form.control,
    name: "status",
  });

  const isActive = useWatch({
    control: form.control,
    name: "is_active",
  });

  const durationValue = useWatch({
    control: form.control,
    name: "duration",
  });

  const durationMode: "dates" | "duration" =
    durationValue != null ? "duration" : "dates";

  /**
   * Reset correctly on open (edit vs create)
   */
  useEffect(() => {
    if (!open) return;

    if (batch) {
      form.reset({
        course_id: batch.course_info?.id ?? "",
        name: batch.name,
        description: batch.description,
        languages: batch.languages?.length ? batch.languages : ["english"],
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

  /**
   * Clear conflicting values when duration mode switches
   */
  useEffect(() => {
    if (durationMode === "dates") {
      form.setValue("duration", null);
    } else {
      form.setValue("start_date", null);
      form.setValue("end_date", null);
    }
  }, [durationMode, form]);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
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
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{batch ? "Edit Batch" : "Create Batch"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Course */}
          <div className="space-y-1">
            <Label>Course</Label>
            <Select
              value={courseId}
              onValueChange={(v) => form.setValue("course_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label>Batch Name</Label>
            <Input {...form.register("name")} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Short batch-specific note shown to students"
              {...form.register("description")}
            />
            <p className="text-xs text-muted-foreground">
              Optional. This is not the course syllabus.
            </p>
          </div>

          {/* Center */}
          <div className="space-y-1">
            <Label>Center</Label>
            <Input
              placeholder="e.g. Solapur, Pune - Wakad"
              {...form.register("center_name")}
            />
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label> Teaching Languages</Label>
            <div className=" flex gap-2 items-center mt-4 ">
              {LANGUAGES.map((lang) => (
                <div key={lang} className="flex items-center gap-2">
                  <Checkbox
                    checked={languages?.includes(lang)}
                    onCheckedChange={(checked) => {
                      const next = checked
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

          {/* Admission Open */}
          <div className="flex items-center justify-start gap-2.5 space-y-2">
            <Label>Admission Open</Label>
            <Switch
              checked={admissionOpen}
              onCheckedChange={(v) => form.setValue("admission_open", v)}
            />
          </div>

          {/* Mode */}
          <div className="space-y-2">
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

          {/* Duration selector */}
          <div className="space-y-3">
            <Label>Batch Duration</Label>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={durationMode === "dates" ? "default" : "outline"}
                onClick={() => {
                  form.setValue("duration", null);
                }}
              >
                Fixed Dates
              </Button>

              <span className="self-center text-muted-foreground">OR</span>

              <Button
                type="button"
                variant={durationMode === "duration" ? "default" : "outline"}
                onClick={() => {
                  form.setValue("start_date", null);
                  form.setValue("end_date", null);
                  form.setValue("duration", 1);
                }}
              >
                Duration
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

          {/* Capacity */}
          <div className="space-y-1">
            <Label>Capacity</Label>
            <Input
              type="number"
              {...form.register("capacity", {
                valueAsNumber: true,
              })}
            />
          </div>

          {/* Status */}
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

          {/* Active */}
          <div className="flex items-center justify-between">
            <Label>Active</Label>

            <Switch
              checked={isActive}
              onCheckedChange={(v) => form.setValue("is_active", v)}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full cursor-pointer"
          >
            {isPending
              ? batch
                ? "Updating..."
                : "Creating..."
              : batch
              ? "Update Batch"
              : "Create Batch"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
