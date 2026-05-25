"use client";

import { useEffect, useState } from "react";

import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { format } from "date-fns";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { Info } from "lucide-react";

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

import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";

import { cn } from "@/src/lib/utils";

import { callServerAction } from "@/src/lib/actions/call-server-action";

import {
  createGroupSessionSchema,
  CreateGroupSessionSchema,
} from "../zod/create-group-session.schema";

import { GroupSession } from "../types/group-session.types";

import { groupSessionsQueryKeys } from "../constants/query-keys";

import { createGroupSession } from "../actions/create-group-session";

import { updateGroupSession } from "../actions/update-group-session";

import { getGroupSessionStudents } from "../api/group-sessions-api";

import { useMentorshipBatches } from "../../../mentorship_sessions/_features/hooks/use-mentorship-batches";
import { useBatchStudents } from "../../../mentorship_sessions/_features/hooks/use-batch-students";
import { MentorshipBatchCombobox } from "../../../mentorship_sessions/_features/components/mentorship-batch-combobox";
import { MentorshipStudentsCombobox } from "../../../mentorship_sessions/_features/components/mentorship-students-combobox";

interface GroupSessionDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  session?: GroupSession;
}

function extractMeetingData(link: string) {
  try {
    const parsed = new URL(link);

    const pathParts = parsed.pathname.split("/");

    const meetingId = pathParts[pathParts.indexOf("j") + 1];

    const meetingPwd = parsed.searchParams.get("pwd");

    if (!meetingId) {
      return null;
    }

    return {
      meeting_id: meetingId,

      meeting_pwd: meetingPwd,
    };
  } catch {
    return null;
  }
}

export function GroupSessionDialog({
  open,
  onOpenChange,
  session,
}: GroupSessionDialogProps) {
  const isEdit = !!session;

  const queryClient = useQueryClient();
  const [isLoadingSelectedStudents, setIsLoadingSelectedStudents] =
    useState(false);
  const form = useForm<CreateGroupSessionSchema>({
    resolver: zodResolver(createGroupSessionSchema),

    defaultValues: {
      title: "",

      description: "",

      audience_type: "batch",

      student_ids: [],

      expected_duration_minutes: 40,

      meeting_link: "",
    },
  });

  const batchId = useWatch({
    control: form.control,

    name: "batch_id",
  });

  const audienceType = useWatch({
    control: form.control,

    name: "audience_type",
  });

  const {
    data: batches,

    isLoading: isBatchesLoading,
  } = useMentorshipBatches(open);

  const {
    data: students,

    isLoading: isStudentsLoading,
  } = useBatchStudents({
    batchId,

    enabled: audienceType === "selected_students" && !!batchId,
  });

  useEffect(() => {
    async function loadStudents() {
      if (
        !open ||
        !isEdit ||
        !session ||
        audienceType !== "selected_students"
      ) {
        return;
      }

      try {
        setIsLoadingSelectedStudents(true);

        const studentIds = await getGroupSessionStudents(session.id);

        form.setValue("student_ids", studentIds);
      } catch {
        toast.error("Failed to load selected students");
      } finally {
        setIsLoadingSelectedStudents(false);
      }
    }

    void loadStudents();
  }, [open, isEdit, session, audienceType, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        title: "",

        description: "",

        batch_id: undefined,

        audience_type: "batch",

        student_ids: [],

        expected_duration_minutes: 40,

        starts_at: undefined,

        meeting_link: "",
      });

      return;
    }

    if (isEdit && session) {
      const joinUrl = session.meeting_id
        ? `https://zoom.us/j/${session.meeting_id}${
            session.meeting_pwd ? `?pwd=${session.meeting_pwd}` : ""
          }`
        : "";

      form.reset({
        title: session.title,

        description: session.description ?? "",

        batch_id: session.batch_id,

        audience_type: session.audience_type,

        student_ids: [],

        expected_duration_minutes: session.expected_duration_minutes,

        starts_at: new Date(session.starts_at),

        meeting_link: joinUrl,
      });
    }
  }, [open, isEdit, session, form]);

  const onSubmit = form.handleSubmit(
    async (values: CreateGroupSessionSchema) => {
      const extracted = values.meeting_link
        ? extractMeetingData(values.meeting_link)
        : null;

      if (values.meeting_link && !extracted) {
        toast.error("Invalid Zoom meeting link");

        return;
      }

      const payload = {
        ...values,

        meeting_id: extracted?.meeting_id ?? null,

        meeting_pwd: extracted?.meeting_pwd ?? null,
      };

      const toastId = toast.loading(
        isEdit ? "Updating group session..." : "Creating group session...",
      );

      try {
        const { error } = isEdit
          ? await callServerAction(updateGroupSession(session.id, payload))
          : await callServerAction(createGroupSession(payload));

        if (error) {
          toast.error(error, {
            id: toastId,
          });

          return;
        }

        toast.success(
          isEdit ? "Group session updated" : "Group session created",
          {
            id: toastId,
          },
        );

        await queryClient.invalidateQueries({
          queryKey: groupSessionsQueryKeys.lists(),
        });

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
      >
        <DialogTitle>
          {isEdit ? "Edit Group Session" : "Create Group Session"}
        </DialogTitle>

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
                      placeholder="Weekly live revision class"
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
                      placeholder="Optional class notes..."
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
                        field.onChange(value);

                        form.setValue("student_ids", []);
                      }}
                      disabled={isBatchesLoading}
                      isLoading={isBatchesLoading}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Audience ---------- */}

            <FormField
              control={form.control}
              name="audience_type"
              render={({ field }) => {
                const handleValueChange = (
                  value: "batch" | "selected_students",
                ) => {
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
                          )}
                        >
                          <RadioGroupItem
                            value="batch"
                            id="audience-batch"
                            className="mt-0.5"
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
                          )}
                        >
                          <RadioGroupItem
                            value="selected_students"
                            id="audience-selected-students"
                            className="mt-0.5"
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
            />

            {/* ---------- Students ---------- */}

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
                          isLoadingSelectedStudents
                        }
                      />
                      {isLoadingSelectedStudents && isEdit && (
                        <p className="text-xs text-muted-foreground">
                          Loading selected students...
                        </p>
                      )}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ---------- Start Time ---------- */}

            <FormField
              control={form.control}
              name="starts_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Date & Time</FormLabel>

                  <FormControl>
                    <Input
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
              name="expected_duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Duration</FormLabel>

                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      max={300}
                      placeholder="40"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        );
                      }}
                    />
                  </FormControl>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Sessions with 3 or more participants may automatically end
                    after 40 minutes. If needed, the teacher can restart the
                    session using the same meeting link.
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Meeting Link ---------- */}

            <FormField
              control={form.control}
              name="meeting_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link (Optional)</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="https://us05web.zoom.us/j/..."
                      {...field}
                    />
                  </FormControl>

                  <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">
                    <Info className="mt-0.5 size-4 shrink-0" />

                    <div className="space-y-1">
                      <p className="font-medium">
                        Meeting links can be added later
                      </p>

                      <p className="text-xs text-sky-700 dark:text-sky-300">
                        Students will only be able to join at the scheduled
                        start time.
                      </p>
                    </div>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------- Submit ---------- */}

            <div className="flex justify-end">
              <Button type="submit">
                {isEdit ? "Update Session" : "Create Session"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
