"use client";

import { useEffect, useState } from "react";
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
import { updateEnrollment } from "../actions/update-enrollment";

import {
  BatchOption,
  CourseOption,
  CreateEnrollmentInput,
  EnrollmentRow,
} from "../types/enrollments";

import {
  createEnrollmentSchema,
  enrollmentTypeOptions,
  deactivationReasonOptions,
} from "../zod-schema/enrollments";

import { toast } from "sonner";

import { UserSearchCombobox } from "@/src/components/ui/user-search-combobox/user-search-combobox";
import { BatchCombobox } from "./batch-combo-box";
import { CourseCombobox } from "./course-combo-box";

import { localDateTimeToUTCISO, toDateTimeLocal } from "@/src/lib/date";

import { callServerAction } from "@/src/lib/actions/call-server-action";
import { Switch } from "@/src/components/ui/switch";

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

          is_active: enrollment.is_active,

          access_starts_at: toDateTimeLocal(enrollment.access_starts_at),

          access_ends_at:
            toDateTimeLocal(enrollment.access_ends_at) ?? undefined,

          notes: enrollment.notes ?? undefined,

          deactivation_reason: enrollment.deactivation_reason ?? undefined,
        }
      : {
          user_id: "",

          target_type: "batch",

          enrollment_type: "standard",

          registration_channel: "offline",

          is_active: true,

          access_starts_at: "",

          access_ends_at: undefined,

          notes: undefined,

          deactivation_reason: undefined,
        },
  });

  const batchId = useWatch({
    control: form.control,
    name: "batch_id",
  });

  const courseId = useWatch({
    control: form.control,
    name: "course_id",
  });

  const targetType = useWatch({
    control: form.control,
    name: "target_type",
  });

  const deactivationReason = useWatch({
    control: form.control,
    name: "deactivation_reason",
  });

  const enrollmentType = useWatch({
    control: form.control,
    name: "enrollment_type",
  });

  const registrationChannel = useWatch({
    control: form.control,
    name: "registration_channel",
  });

  const isActive = useWatch({
    control: form.control,
    name: "is_active",
  });

  const userId = useWatch({
    control: form.control,
    name: "user_id",
  });

  const isSubmitting = form.formState.isSubmitting;
  /* auto-fill batch dates */
  useEffect(() => {
    if (isEdit) return;
    if (accessTouched) return;
    if (!batchId) return;

    const batch = batches.find((b) => b.id === batchId);

    if (!batch) return;

    if (batch.start_date && batch.end_date) {
      form.setValue("access_starts_at", `${batch.start_date}T00:00`);

      form.setValue("access_ends_at", `${batch.end_date}T23:59`);
    }
  }, [batchId, batches, isEdit, accessTouched, form]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      const toastId = toast.loading(
        isEdit ? "Updating enrollment..." : "Creating enrollment...",
      );

      try {
        const payload: CreateEnrollmentInput = {
          ...values,

          access_starts_at: localDateTimeToUTCISO(values.access_starts_at)!,

          access_ends_at: values.access_ends_at
            ? localDateTimeToUTCISO(values.access_ends_at)!
            : undefined,
        };

        if (isEdit && enrollment) {
          const { error } = await callServerAction(
            updateEnrollment(enrollment.id, payload),
          );

          if (error) {
            toast.error(error, {
              id: toastId,
            });
            return;
          }

          toast.success("Enrollment updated", {
            id: toastId,
          });
        } else {
          const { error } = await callServerAction(createEnrollment(payload));

          if (error) {
            toast.error(error, {
              id: toastId,
            });
            return;
          }

          toast.success("Enrollment created", {
            id: toastId,
          });
        }

        onClose();
      } catch {
        toast.error("Something went wrong", { id: toastId });
      }
    },

    (errors) => {
      const firstError = Object.values(errors)[0];

      toast.error(firstError?.message ?? "Please fix form errors");
    },
  );

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (isSubmitting) return;

        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Enrollment" : "Create Enrollment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
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

          {/* PICKER */}
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
                  v as CreateEnrollmentInput["enrollment_type"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {enrollmentTypeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* REGISTRATION */}
          <div className="space-y-2">
            <Label>Registration Channel</Label>

            <Select
              value={registrationChannel}
              onValueChange={(v) =>
                form.setValue(
                  "registration_channel",
                  v as CreateEnrollmentInput["registration_channel"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="offline">Offline</SelectItem>

                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ACCESS */}
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
            <Label>
              Notes
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </Label>

            <Textarea {...form.register("notes")} />
          </div>

          {/* ACTIVE STATUS */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="active-switch">Enrollment Active</Label>

                <p className="text-xs text-muted-foreground">
                  Turn off to temporarily block student access.
                </p>
              </div>

              <Switch
                id="active-switch"
                checked={isActive}
                onCheckedChange={(checked) => {
                  form.setValue("is_active", checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });

                  if (checked) {
                    form.setValue("deactivation_reason", undefined, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </div>

            {!isActive && (
              <div className="space-y-2 border-t pt-4">
                <Label>Deactivation Reason</Label>

                <Select
                  value={deactivationReason ?? ""}
                  onValueChange={(v) =>
                    form.setValue(
                      "deactivation_reason",
                      v as CreateEnrollmentInput["deactivation_reason"],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    )
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>

                  <SelectContent>
                    {deactivationReasonOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  This helps admins understand why access was disabled.
                </p>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
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
