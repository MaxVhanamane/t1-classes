"use client";

import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { format } from "date-fns";

import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

import { Input } from "@/src/components/ui/input";

import { Textarea } from "@/src/components/ui/textarea";

import { Button } from "@/src/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

// import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";

import {
  createMentorshipSessionSchema,
  CreateMentorshipSessionSchema,
} from "../zod/create-mentorship-session.schema";
import { useMentorshipBatches } from "../hooks/use-mentorship-batches";
import { useBatchStudents } from "../hooks/use-batch-students";
import { useMentorshipSessionStudents } from "../hooks/use-mentorship-session-students";
import { useEffect } from "react";
import { MentorshipBatchCombobox } from "./mentorship-batch-combobox";
import { MentorshipStudentsCombobox } from "./mentorship-students-combobox";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { createMentorshipSession } from "../actions/create-mentorship-session";
import { mentorshipQueryKeys } from "../constants/query-keys";
import { MentorshipSession } from "../types/mentorship.types";
import { updateMentorshipSession } from "../actions/update-mentorship-session";
// import { cn } from "@/src/lib/utils";

interface MentorshipSessionDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  session?: MentorshipSession;
}

export function MentorshipSessionDialog({
  open,
  onOpenChange,
  session,
}: MentorshipSessionDialogProps) {
  const isEdit = !!session;
  const hasStarted = !!session && new Date() >= new Date(session.starts_at);

  const hasMeeting = !!session?.meeting_id;

  const canEditSchedule = !hasStarted && !hasMeeting;

  const queryClient = useQueryClient();
  const form = useForm<CreateMentorshipSessionSchema>({
    resolver: zodResolver(createMentorshipSessionSchema),

    defaultValues: {
      title: "",

      description: "",

      audience_type: "selected_students",

      student_ids: [],

      duration_minutes: 15,
    },
  });

  const batchId = useWatch({
    control: form.control,

    name: "batch_id",
  });

  // maybe we will use this in future
  const audienceType = useWatch({
    control: form.control,

    name: "audience_type",
  });

  const {
    data: batches,

    isLoading: isBatchesLoading,
  } = useMentorshipBatches(open);

  const { data: students, isLoading: isStudentsLoading } = useBatchStudents({
    batchId,

    enabled: audienceType === "selected_students" && !!batchId,
  });

  const { data: selectedStudentIds, isLoading: isSelectedStudentsLoading } =
    useMentorshipSessionStudents({
      sessionId: session?.id,

      enabled: open && isEdit && audienceType === "selected_students",
    });

  useEffect(() => {
    if (
      !open ||
      audienceType !== "selected_students" ||
      selectedStudentIds === undefined
    ) {
      return;
    }

    form.setValue("student_ids", selectedStudentIds);
  }, [open, audienceType, selectedStudentIds, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        title: "",
        description: "",
        batch_id: undefined,
        audience_type: "selected_students",
        student_ids: [],
        duration_minutes: 15,
        starts_at: undefined,
      });

      return;
    }

    if (isEdit && session) {
      form.reset({
        title: session.title,

        description: session.description ?? "",

        batch_id: session.batch_id,

        audience_type: "selected_students",

        student_ids: [],

        duration_minutes: session.duration_minutes,

        starts_at: new Date(session.starts_at),
      });
    }
  }, [open, isEdit, session, form]);

  const onSubmit = form.handleSubmit(
    async (values: CreateMentorshipSessionSchema) => {
      const toastId = toast.loading(
        isEdit
          ? "Updating mentorship session..."
          : "Creating mentorship session...",
      );

      try {
        const { error } = isEdit
          ? await callServerAction(updateMentorshipSession(session.id, values))
          : await callServerAction(createMentorshipSession(values));

        if (error) {
          toast.error(error, {
            id: toastId,
          });

          return;
        }

        toast.success(
          isEdit ? "Mentorship session updated" : "Mentorship session created",
          {
            id: toastId,
          },
        );

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: mentorshipQueryKeys.lists(),
          }),

          ...(isEdit
            ? [
                queryClient.invalidateQueries({
                  queryKey: mentorshipQueryKeys.students(session.id),
                }),
              ]
            : []),
        ]);

        onOpenChange(false);
      } catch {
        toast.error("Something went wrong", {
          id: toastId,
        });
      }
    },

    (errors) => {
      const firstError = Object.values(errors)[0];

      toast.error(firstError?.message ?? "Please fix form errors");
    },
  );

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
      >
        <DialogTitle>
          {isEdit ? "Edit Mentorship Session" : "Create Mentorship Session"}
        </DialogTitle>
        {isEdit && !canEditSchedule && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
            Schedule settings can no longer be edited because this session has
            already started.
          </div>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* ---------- Title ---------- */}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Weekly progress discussion"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Description ---------- */}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Optional session notes..."
                      className="min-h-28"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Batch ---------- */}

            <FormField
              control={form.control}
              name="batch_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MentorshipBatchCombobox
                      batches={batches ?? []}
                      value={field.value}
                      onChange={(value) => {
                        if (isEdit) {
                          toast.error("Batch cannot be changed after creation");

                          return;
                        }
                        field.onChange(value);

                        form.setValue("student_ids", []);
                      }}
                      disabled={isBatchesLoading || isEdit}
                      isLoading={isBatchesLoading}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Audience ---------- */}

            {/* <FormField
              control={form.control}
              name="audience_type"
              render={({ field }) => {
                const handleValueChange = (
                  value: "batch" | "selected_students",
                ) => {
                  if (isEdit && !canEditSchedule) {
                    toast.error("Audience can no longer be changed");

                    return;
                  }

                  if (value === "selected_students" && !batchId) {
                    toast.error("Select a batch first");

                    return;
                  }

                  field.onChange(value);

                  if (value === "batch") {
                    form.setValue("student_ids", []);
                  }
                };

                return (
                  <FormItem className="space-y-3">
                    <FormLabel>Audience</FormLabel>

                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={handleValueChange}
                        className="grid gap-3"
                      >
                        <label
                          htmlFor="audience-batch"
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                            "hover:bg-muted/50",

                            field.value === "batch" &&
                              "border-primary bg-primary/5",
                            isEdit &&
                              !canEditSchedule &&
                              "cursor-not-allowed opacity-60",
                          )}
                        >
                          <RadioGroupItem
                            value="batch"
                            id="audience-batch"
                            className="mt-0.5"
                            disabled={isEdit && !canEditSchedule}
                          />

                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Entire Batch
                            </div>

                            <p className="text-sm text-muted-foreground">
                              Every student enrolled in this batch can join the
                              session.
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="audience-selected-students"
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                            "hover:bg-muted/50",
                            field.value === "selected_students" &&
                              "border-primary bg-primary/5",
                            isEdit &&
                              !canEditSchedule &&
                              "cursor-not-allowed opacity-60",
                          )}
                        >
                          <RadioGroupItem
                            value="selected_students"
                            id="audience-selected-students"
                            className="mt-0.5"
                            disabled={isEdit && !canEditSchedule}
                          />

                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Selected Students
                            </div>

                            <p className="text-sm text-muted-foreground">
                              Only manually selected students will be able to
                              join.
                            </p>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                );
              }}
            /> */}

            {/* ---------- Selected Students ---------- */}

            {audienceType === "selected_students" && (
              <FormField
                control={form.control}
                name="student_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Students</FormLabel>

                    <FormControl>
                      <MentorshipStudentsCombobox
                        students={students ?? []}
                        value={field.value}
                        onChange={field.onChange}
                        batchId={batchId}
                        disabled={
                          !batchId ||
                          isStudentsLoading ||
                          isSelectedStudentsLoading ||
                          (isEdit && !canEditSchedule)
                        }
                        maxSelectionCount={2}
                        maxSelectionMessage="Mentorship sessions are intended for one student. Maximum 2 students are allowed."
                      />
                    </FormControl>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      Mentorship sessions are intended for one-on-one guidance.
                      Select only one student whenever possible. A maximum of 2
                      students is allowed. For sessions involving more students,
                      please use Group Sessions instead.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ---------- Start Date ---------- */}
            <FormField
              control={form.control}
              name="starts_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Date & Time</FormLabel>

                  <FormControl>
                    <Input
                      disabled={isEdit && !canEditSchedule}
                      type="datetime-local"
                      value={
                        field.value
                          ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                          : ""
                      }
                      onChange={(e) => {
                        field.onChange(new Date(e.target.value));
                      }}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Duration ---------- */}

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>

                  <Select
                    disabled={isEdit && !canEditSchedule}
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="15">15 Minutes</SelectItem>

                      <SelectItem value="20">20 Minutes</SelectItem>

                      <SelectItem value="25">25 Minutes</SelectItem>

                      <SelectItem value="30">30 Minutes</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Submit ---------- */}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                    ? "Update Session"
                    : "Create Session"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
