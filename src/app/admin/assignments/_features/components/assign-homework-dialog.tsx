"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Info, FileCheck2, FileText } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";

import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";
import { callServerAction } from "@/src/lib/actions/call-server-action";

import {
  assignHomeworkSchema,
  AssignHomeworkFormValues,
} from "../zod/assignment.schema";
import {
  getFilteredChapters,
  getFilteredMaterials,
} from "../../actions/fetch-assignment-options";
import { createBatchAssignment } from "../../actions/create-batch-assignment";
import { updateBatchAssignment } from "../../actions/update-batch-assignment";
import { DateTimePicker } from "@/src/components/ui/common/date-time-picker";
import type { BatchAssignmentRow } from "../types/batch-assignments.types";

type AssignHomeworkDialogProps = {
  batchId: string;
  subjects: string[];
  classLevel: number | null;
  targetExam: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: BatchAssignmentRow | null;
  onViewPdf?: (path: string, title: string) => void;
};

function getLocalDatetimeString() {
  return new Date().toISOString();
}

const STALE_TIME = 5 * 60 * 1000;

export function AssignHomeworkDialog({
  batchId,
  subjects,
  classLevel,
  targetExam,
  open,
  onOpenChange,
  assignment,
  onViewPdf,
}: AssignHomeworkDialogProps) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const isEdit = !!assignment;

  const form = useForm<AssignHomeworkFormValues>({
    resolver: zodResolver(assignHomeworkSchema),
    defaultValues: {
      batch_id: batchId,
      subject: "",
      chapter_id: "",
      material_id: "",
      publish_date: getLocalDatetimeString(),
      due_date: "",
      is_solution_visible: false,
      auto_publish_solution_at: "",
    },
  });

  const selectedSubject = form.watch("subject");
  const selectedChapterId = form.watch("chapter_id");
  const selectedMaterialId = form.watch("material_id");
  const isSolutionVisible = form.watch("is_solution_visible");

  const { data: chapters = [], isLoading: isLoadingChapters } = useQuery({
    queryKey: ["homework-chapters", selectedSubject, classLevel, targetExam],
    queryFn: () => getFilteredChapters(selectedSubject, classLevel, targetExam),
    enabled: !!selectedSubject && open,
    staleTime: STALE_TIME,
  });

  const { data: materials = [], isLoading: isLoadingMaterials } = useQuery({
    queryKey: ["homework-materials", selectedChapterId],
    queryFn: () => getFilteredMaterials(selectedChapterId),
    enabled: !!selectedChapterId && open,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (!isEdit && open) {
      form.setValue("chapter_id", "", { shouldValidate: false });
      form.setValue("material_id", "", { shouldValidate: false });
    }
  }, [selectedSubject, form, isEdit, open]);

  useEffect(() => {
    if (!isEdit && open) {
      form.setValue("material_id", "", { shouldValidate: false });
    }
  }, [selectedChapterId, form, isEdit, open]);

  useEffect(() => {
    if (open) {
      if (assignment) {
        form.reset({
          batch_id: batchId,
          subject: assignment.material.chapter.subject,
          chapter_id: assignment.material.chapter.id,
          material_id: assignment.material.id,
          publish_date: assignment.publish_date,
          due_date: assignment.due_date,
          is_solution_visible: assignment.is_solution_visible,
          auto_publish_solution_at: assignment.auto_publish_solution_at ?? "",
        });
      } else {
        form.reset({
          batch_id: batchId,
          subject: "",
          chapter_id: "",
          material_id: "",
          publish_date: getLocalDatetimeString(),
          due_date: "",
          is_solution_visible: false,
          auto_publish_solution_at: "",
        });
      }
    } else {
      form.reset();
    }
  }, [open, assignment, batchId, form]);

  // Use type casting here safely since we expect the server action to return these fields
  const selectedMaterial = materials.find(
    (m) => m.id === selectedMaterialId,
  ) as
    | {
        id: string;
        title: string;
        hasSolution: boolean;
        file_path: string;
        solution_file_path: string | null;
      }
    | undefined;

  const hasSolution = selectedMaterial?.hasSolution ?? false;

  const onSubmit = form.handleSubmit(
    async (values) => {
      const toastId = toast.loading(
        isEdit ? "Updating assignment..." : "Assigning material...",
      );
      try {
        setSaving(true);
        let error;

        if (isEdit && assignment) {
          const res = await callServerAction(
            updateBatchAssignment(assignment.id, values),
          );
          error = res.error;
        } else {
          const res = await callServerAction(createBatchAssignment(values));
          error = res.error;
        }

        if (error) {
          toast.error(error, { id: toastId });
          return;
        }

        toast.success(
          isEdit
            ? "Assignment updated successfully!"
            : "Material assigned successfully to batch!",
          {
            id: toastId,
          },
        );
        await queryClient.invalidateQueries({
          queryKey: ["admin", "batch-assignments", batchId],
        });
        onOpenChange(false);
      } catch {
        toast.error("Something went wrong", { id: toastId });
      } finally {
        setSaving(false);
      }
    },
    (errors) => {
      toast.error(extractFirstErrorMessage(errors) ?? "Please fix form errors");
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="w-[calc(100vw-12px)] sm:w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Assignment" : "Assign Homework"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {!isEdit && (classLevel || targetExam) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                <Info className="size-4 text-primary shrink-0" />
                <span>Filters auto-applied from batch constraints:</span>
                {classLevel && (
                  <span className="font-medium bg-background px-2 py-0.5 rounded border shadow-sm">
                    Class {classLevel}
                  </span>
                )}
                {targetExam && (
                  <span className="font-medium bg-background px-2 py-0.5 rounded border shadow-sm uppercase">
                    {targetExam}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 bg-muted/10 p-5 rounded-xl border border-border/50">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Subject</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full [&>span]:line-clamp-1">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.length === 0 ? (
                          <div className="p-2 text-sm text-center text-muted-foreground">
                            No subjects found
                          </div>
                        ) : (
                          subjects.map((sub) => (
                            <SelectItem
                              key={sub}
                              value={sub}
                              className="capitalize"
                            >
                              {sub}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chapter_id"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Chapter</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEdit || !selectedSubject || isLoadingChapters}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full [&>span]:line-clamp-1">
                          <SelectValue
                            placeholder={
                              isLoadingChapters
                                ? "Loading..."
                                : "Select chapter"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chapters.length === 0 && !isLoadingChapters ? (
                          <div className="p-3 text-sm text-center text-muted-foreground">
                            No chapters available
                          </div>
                        ) : (
                          chapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.chapter_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material_id"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Material</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        isEdit || !selectedChapterId || isLoadingMaterials
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full [&>span]:line-clamp-1">
                          <SelectValue
                            placeholder={
                              isLoadingMaterials
                                ? "Loading..."
                                : "Select material"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.length === 0 && !isLoadingMaterials ? (
                          <div className="p-3 text-sm text-center text-muted-foreground">
                            No materials available
                          </div>
                        ) : (
                          materials.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />

                    {/* 🔥 INLINE PDF PREVIEW BUTTONS */}
                    {selectedMaterial && onViewPdf && (
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 animate-in fade-in slide-in-from-top-1">
                        {selectedMaterial.file_path && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 px-3 text-[11px] font-medium"
                            onClick={() =>
                              onViewPdf(
                                selectedMaterial.file_path,
                                `${selectedMaterial.title} - Question`,
                              )
                            }
                          >
                            <FileText className="mr-1.5 h-3 w-3" />
                            Preview Question
                          </Button>
                        )}
                        {selectedMaterial.solution_file_path && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 px-3 text-[11px] font-medium"
                            onClick={() =>
                              onViewPdf(
                                selectedMaterial.solution_file_path!,
                                `${selectedMaterial.title} - Solution`,
                              )
                            }
                          >
                            <FileCheck2 className="mr-1.5 h-3 w-3 text-green-600" />
                            Preview Solution
                          </Button>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 grid-cols-1">
              <FormField
                control={form.control}
                name="publish_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Date & Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-[10.5px] mt-1 text-muted-foreground/80 tracking-wide font-medium">
                      When students can see the question PDF
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-destructive">
                      Due Date & Time *
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-[10.5px] mt-1 text-muted-foreground/80 tracking-wide font-medium">
                      Deadline for submission
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(selectedMaterialId && hasSolution) ||
            (isEdit && assignment?.material.id === selectedMaterialId) ? (
              <div className="space-y-4 border rounded-xl p-4 sm:p-5 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <FileCheck2 className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Solution Available
                    </h4>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                      The selected assignment includes a solution PDF. Do you
                      want to publish it to students immediately, or schedule it
                      for a later date?
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <FormField
                    control={form.control}
                    name="is_solution_visible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background gap-3">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-medium">
                            Publish Immediately
                          </FormLabel>
                          <p className="text-[11px] text-muted-foreground">
                            Students can view answers right away
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!isSolutionVisible && (
                    <FormField
                      control={form.control}
                      name="auto_publish_solution_at"
                      render={({ field }) => (
                        <FormItem className="flex flex-col rounded-lg border p-4 shadow-sm bg-background gap-3 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-1">
                            <FormLabel className="text-sm font-medium">
                              Schedule Date
                            </FormLabel>
                            <p className="text-[11px] text-muted-foreground">
                              Reveal automatically at a specific time
                            </p>
                          </div>
                          <FormControl>
                            <div className="w-full">
                              <DateTimePicker
                                value={field.value ?? undefined}
                                onChange={field.onChange}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            ) : null}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !selectedMaterialId}
                className="w-full sm:w-auto mt-2 sm:mt-0"
              >
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}{" "}
                {isEdit ? "Update Assignment" : "Confirm Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
