"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, FolderPlus } from "lucide-react";
import { toast } from "sonner";

import {
  homeworkChapterSchema,
  HomeworkChapterFormValues,
} from "../zod/homework-chapter.schema";

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

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";
import { HomeworkChapter } from "../../[chapterId]/_features/types/homework";
import { homeworkQueryKeys } from "../../[chapterId]/_features/constants/query-keys";
import {
  SUBJECTS,
  SUBJECT_LABELS,
  TARGET_EXAMS,
  TARGET_EXAM_LABELS,
} from "@/src/app/admin/batches/_features/zod-schema/schema";
import { createHomeworkChapter } from "../actions/create-homework-chapter";
import { updateHomeworkChapter } from "../actions/update-homework-chapter";

const defaultValues: Partial<HomeworkChapterFormValues> = {
  chapter_name: "",
  chapter_number: undefined, // Undefined leaves the number input perfectly blank
  class_level: null,
  target_exam: null,
};

type HomeworkChapterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter?: HomeworkChapter;
};

export function HomeworkChapterDialog({
  open,
  onOpenChange,
  chapter,
}: HomeworkChapterDialogProps) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const isEdit = !!chapter;

  const form = useForm<HomeworkChapterFormValues>({
    resolver: zodResolver(homeworkChapterSchema),
    defaultValues: chapter
      ? {
          chapter_name: chapter.chapter_name,
          chapter_number: chapter.chapter_number ?? undefined,
          subject: chapter.subject,
          class_level: chapter.class_level,
          target_exam: chapter.target_exam,
        }
      : (defaultValues as HomeworkChapterFormValues),
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues as HomeworkChapterFormValues);
      return;
    }
    if (chapter) {
      form.reset({
        chapter_name: chapter.chapter_name,
        chapter_number: chapter.chapter_number ?? undefined,
        subject: chapter.subject,
        class_level: chapter.class_level,
        target_exam: chapter.target_exam,
      });
    } else {
      form.reset(defaultValues as HomeworkChapterFormValues);
    }
  }, [open, chapter, form]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      const toastId = toast.loading(
        chapter ? "Updating chapter..." : "Creating chapter...",
      );

      try {
        setSaving(true);

        if (chapter) {
          const { error } = await callServerAction(
            updateHomeworkChapter(chapter.id, values),
          );
          if (error) {
            toast.error(error, { id: toastId });
            return;
          }
        } else {
          const { error } = await callServerAction(
            createHomeworkChapter(values),
          );
          if (error) {
            toast.error(error, { id: toastId });
            return;
          }
        }

        await queryClient.invalidateQueries({
          queryKey: homeworkQueryKeys.chapters(),
        });

        toast.success(
          chapter ? "Chapter updated" : "Chapter created successfully",
          { id: toastId },
        );

        onOpenChange(false);
        form.reset();
      } catch {
        toast.error("Something went wrong", { id: toastId });
      } finally {
        setSaving(false);
      }
    },
    (errors) => {
      const message = extractFirstErrorMessage(errors);
      toast.dismiss();
      toast.error(message ?? "Please fix the form errors");
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onFocusOutside={(e) => e.preventDefault()}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Chapter" : "Create New Chapter"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBJECTS.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {SUBJECT_LABELS[sub]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="chapter_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter No. *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 1"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class (Optional)</FormLabel>
                    <Select
                      value={field.value?.toString() ?? "__none__"}
                      onValueChange={(val) =>
                        field.onChange(val === "__none__" ? null : Number(val))
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {[6, 7, 8, 9, 10, 11, 12].map((lvl) => (
                          <SelectItem key={lvl} value={String(lvl)}>
                            Class {lvl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="chapter_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Chemical Reactions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_exam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Exam (Optional)</FormLabel>
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(val) =>
                      field.onChange(val === "__none__" ? null : val)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {TARGET_EXAMS.map((exam) => (
                        <SelectItem key={exam} value={exam}>
                          {TARGET_EXAM_LABELS[exam]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <FolderPlus className="mr-2 size-4" />
                )}
                {isEdit ? "Update Chapter" : "Create Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
