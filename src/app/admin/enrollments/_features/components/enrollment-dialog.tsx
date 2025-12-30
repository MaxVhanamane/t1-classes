"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/src/components/ui/textarea";

import { createEnrollment } from "../actions/create-enrollment";
import {
  BatchOption,
  CourseOption,
  CreateEnrollmentInput,
  EnrollmentRow,
} from "../types/enrollments";
import { createEnrollmentSchema } from "../zod-schema/enrollments";
import { toast } from "sonner";
import { updateEnrollment } from "../actions/update-enrollment";
import { UserSearchCombobox } from "@/src/components/ui/user-search-combobox/user-search-combobox";
import {
  addDaysFromTodayEndOfDayISO,
  startOfTodayISO,
  toDateTimeLocal,
} from "@/src/lib/date";
import { BatchCombobox } from "./batch-combo-box";
import { CourseCombobox } from "./course-combo-box";

type CreateEnrollmentDialogProps = {
  batches: BatchOption[];
  courses: CourseOption[];
  enrollment?: EnrollmentRow | null;
  onClose: () => void;
};

export function EnrollmentDialog({
  batches,
  courses,
  enrollment,
  onClose,
}: CreateEnrollmentDialogProps) {
  const isEdit = Boolean(enrollment);
  const [isPending, startTransition] = useTransition();
  const [accessTouched, setAccessTouched] = useState(false);

  const form = useForm<CreateEnrollmentInput>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: enrollment
      ? {
          user_id: enrollment.user?.id ?? "",
          target_type: enrollment.target_type,
          batch_id: enrollment.batch?.id,
          course_id: enrollment.course?.id,
          enrollment_type: enrollment.enrollment_type,
          registration_channel: enrollment.registration_channel,
          status: enrollment.status,
          is_active: enrollment.is_active,
          access_starts_at: toDateTimeLocal(enrollment.access_starts_at),
          access_ends_at:
            toDateTimeLocal(enrollment.access_ends_at) ?? undefined,
          notes: enrollment.notes ?? undefined,
        }
      : {
          target_type: "batch",
          enrollment_type: "paid",
          registration_channel: "offline",
          status: "ongoing",
          is_active: true,
        },
  });

  const batchId = useWatch({ control: form.control, name: "batch_id" });
  const courseId = useWatch({ control: form.control, name: "course_id" });
  const targetType = useWatch({ control: form.control, name: "target_type" });
  const enrollmentType = useWatch({
    control: form.control,
    name: "enrollment_type",
  });
  const registrationChannel = useWatch({
    control: form.control,
    name: "registration_channel",
  });
  const status = useWatch({ control: form.control, name: "status" });
  const userId = useWatch({ control: form.control, name: "user_id" });

  /** Auto-fill access dates ONLY in create mode */
  useEffect(() => {
    if (isEdit) return;
    if (accessTouched) return;
    if (!batchId) return;

    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    if (batch.start_date && batch.end_date) {
      form.setValue("access_starts_at", `${batch.start_date}T00:00`);
      form.setValue("access_ends_at", `${batch.end_date}T23:59`);
      return;
    }

    if (batch.duration) {
      form.setValue("access_starts_at", startOfTodayISO());
      form.setValue(
        "access_ends_at",
        addDaysFromTodayEndOfDayISO(batch.duration)
      );
    }
  }, [batchId, batches, isEdit, accessTouched, form]);

  async function onSubmit(values: CreateEnrollmentInput) {
    startTransition(async () => {
      try {
        if (isEdit && enrollment) {
          await updateEnrollment(enrollment.id, values);
          toast.success("Enrollment updated");
        } else {
          await createEnrollment(values);
          toast.success("Enrollment created");
        }

        onClose();
      } catch {
        toast.error(
          isEdit ? "Failed to update enrollment" : "Failed to create enrollment"
        );
      }
    });
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (isPending) return; //  block close while saving
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className=" max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Enrollment" : "Create Enrollment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* USER */}
          <div className="space-y-2">
            <Label>User</Label>
            <UserSearchCombobox
              selectedUser={enrollment?.user ?? null}
              value={userId}
              onChange={(id) => form.setValue("user_id", id)}
            />
          </div>

          {/* TARGET TYPE */}
          <div className="space-y-2">
            <Label>Target Type</Label>
            <Select
              value={targetType}
              onValueChange={(v) =>
                form.setValue("target_type", v as "batch" | "course")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch">Batch</SelectItem>
                <SelectItem value="course">Course</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BATCH / COURSE PICKER */}
          {targetType === "batch" && (
            <BatchCombobox
              batches={batches}
              value={batchId}
              onChange={(id) => form.setValue("batch_id", id)}
            />
          )}

          {targetType === "course" && (
            <CourseCombobox
              courses={courses}
              value={courseId}
              onChange={(id) => form.setValue("course_id", id)}
            />
          )}

          {/* ENROLLMENT TYPE */}
          <div className="space-y-2">
            <Label>Enrollment Type</Label>
            <Select
              value={enrollmentType}
              onValueChange={(v) =>
                form.setValue(
                  "enrollment_type",
                  v as CreateEnrollmentInput["enrollment_type"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* REGISTRATION CHANNEL */}
          <div className="space-y-2">
            <Label>Registration Channel</Label>
            <Select
              value={registrationChannel}
              onValueChange={(v) =>
                form.setValue(
                  "registration_channel",
                  v as CreateEnrollmentInput["registration_channel"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* STATUS */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                form.setValue("status", v as CreateEnrollmentInput["status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ACCESS DATES */}
          <div className="space-y-2">
            <Label>Access Starts At</Label>
            <Input
              type="datetime-local"
              {...form.register("access_starts_at")}
              onChange={(e) => {
                setAccessTouched(true);
                form.setValue("access_starts_at", e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Access Ends At</Label>
            <Input
              type="datetime-local"
              {...form.register("access_ends_at")}
              onChange={(e) => {
                setAccessTouched(true);
                form.setValue("access_ends_at", e.target.value);
              }}
            />
          </div>

          {!isEdit && !accessTouched && targetType === "batch" && (
            <p className="text-xs text-muted-foreground">
              Access dates auto-filled from batch. You can edit them.
            </p>
          )}

          {/* NOTES */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save Changes"
                : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
