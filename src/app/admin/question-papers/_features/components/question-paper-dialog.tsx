"use client";

import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useR2Upload } from "@/src/hooks/use-r2-upload";

import { createQuestionPaper } from "../actions/create-question-paper";
import { updateQuestionPaper } from "../actions/update-question-paper";

import {
  questionPaperSchema,
  QuestionPaperFormValues,
} from "../zod/question-paper.schema";

import { QuestionPaper } from "../types/question-paper";

import { questionPaperQueryKeys } from "../constants/query-keys";

import {
  QUESTION_PAPER_YEAR_OPTIONS,
  QUESTION_PAPER_CATEGORIES,
} from "../constants/question-paper.constants";

import {
  SUBJECTS,
  SUBJECT_LABELS,
  TARGET_EXAMS,
  TARGET_EXAM_LABELS,
} from "../../../batches/_features/zod-schema/schema";

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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/components/ui/command";

import { Badge } from "@/src/components/ui/badge";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { Textarea } from "@/src/components/ui/textarea";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

const defaultValues: QuestionPaperFormValues = {
  title: "",

  description: null,

  class_level: null,

  target_exam: null,

  subject: null,

  paper_category: "previous_year",

  years: [],

  file_path: "",

  file_size: null,
};

type QuestionPaperDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  questionPaper?: QuestionPaper;
};

export function QuestionPaperDialog({
  open,
  onOpenChange,
  questionPaper,
}: QuestionPaperDialogProps) {
  const queryClient = useQueryClient();

  const { uploadFile, uploading } = useR2Upload();

  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const isEdit = !!questionPaper;

  const form = useForm<QuestionPaperFormValues>({
    resolver: zodResolver(questionPaperSchema),

    defaultValues: questionPaper
      ? {
          title: questionPaper.title,
          target_exam: questionPaper.target_exam,
          subject: questionPaper.subject,
          paper_category: questionPaper.paper_category,
          years: questionPaper.years,
          file_path: questionPaper.file_path,
          file_size: questionPaper.file_size,
          description: questionPaper.description,
          class_level: questionPaper.class_level,
        }
      : defaultValues,
  });

  useEffect(() => {
    if (!open) {
      setPdfFile(null);
      form.reset(defaultValues);
      return;
    }

    if (questionPaper) {
      form.reset({
        title: questionPaper.title,
        target_exam: questionPaper.target_exam,
        subject: questionPaper.subject,
        paper_category: questionPaper.paper_category,
        years: questionPaper.years,
        file_path: questionPaper.file_path,
        file_size: questionPaper.file_size,
        description: questionPaper.description,
        class_level: questionPaper.class_level,
      });
    } else {
      setPdfFile(null);
      form.reset(defaultValues);
    }
  }, [open, questionPaper, form]);

  const selectedYears = form.watch("years");

  const paperCategory = form.watch("paper_category");

  const dialogTitle = isEdit ? "Edit Question Paper" : "Upload Question Paper";

  const onSubmit = form.handleSubmit(
    async (values) => {
      const toastId = toast.loading(
        questionPaper
          ? "Updating question paper..."
          : "Creating question paper...",
      );

      try {
        setSaving(true);

        if (!questionPaper && !pdfFile) {
          toast.error("Please select a PDF", {
            id: toastId,
          });

          return;
        }

        const isReplacingPdf = pdfFile !== null;

        let filePath = values.file_path;

        let fileSize = values.file_size;

        if (isReplacingPdf) {
          toast.loading("Uploading PDF...", {
            id: toastId,
          });

          const upload = await uploadFile({
            file: pdfFile,
            assetType: "question_paper",
          });

          filePath = upload.key;

          fileSize = pdfFile.size;
        }

        const payload = {
          ...values,

          file_path: filePath,

          file_size: fileSize,
        };

        if (questionPaper) {
          const { error } = await callServerAction(
            updateQuestionPaper(questionPaper.id, payload),
          );

          if (error) {
            toast.error(error, {
              id: toastId,
            });

            return;
          }
        } else {
          const { error } = await callServerAction(
            createQuestionPaper(payload),
          );

          if (error) {
            toast.error(error, {
              id: toastId,
            });

            return;
          }
        }

        await queryClient.invalidateQueries({
          queryKey: questionPaperQueryKeys.lists(),
        });

        toast.success(
          questionPaper
            ? isReplacingPdf
              ? "Question paper and PDF updated"
              : "Question paper updated"
            : "Question paper created",
          {
            id: toastId,
          },
        );

        onOpenChange(false);

        form.reset();

        setPdfFile(null);
      } catch {
        toast.error("Something went wrong", {
          id: toastId,
        });
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

  const availableYears = useMemo(() => QUESTION_PAPER_YEAR_OPTIONS, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onFocusOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-2xl max-h-[90dvh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input placeholder="JEE Physics PYQ 2020–2025" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Short description about this paper"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="class_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Level (Optional)</FormLabel>

                    <Select
                      value={field.value?.toString() ?? "__all__"}
                      onValueChange={(value) =>
                        field.onChange(
                          value === "__all__" ? null : Number(value),
                        )
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="__all__">None</SelectItem>

                        {[6, 7, 8, 9, 10, 11, 12].map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            Class {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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
                      value={field.value ?? "__all__"}
                      onValueChange={(value) =>
                        field.onChange(value === "__all__" ? null : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="__all__">None</SelectItem>

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

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Optional)</FormLabel>

                    <Select
                      value={field.value ?? "__all__"}
                      onValueChange={(value) =>
                        field.onChange(value === "__all__" ? null : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="__all__">None</SelectItem>

                        {SUBJECTS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {SUBJECT_LABELS[subject]}
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
              name="paper_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {QUESTION_PAPER_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {paperCategory === "previous_year" && (
              <FormField
                control={form.control}
                name="years"
                render={() => (
                  <FormItem>
                    <FormLabel>Years</FormLabel>
                    <p className="text-muted-foreground text-xs">
                      If this PDF contains questions from multiple years, select
                      all applicable years.
                    </p>

                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {selectedYears.length > 0
                            ? `${selectedYears.length} year(s) selected`
                            : "Select Years"}

                          <ChevronsUpDown className="ml-2 size-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-62.5 p-0">
                        <Command>
                          <CommandEmpty>No years found.</CommandEmpty>

                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {availableYears.map((year) => {
                              const selected = selectedYears.includes(year);

                              return (
                                <CommandItem
                                  key={year}
                                  onSelect={() => {
                                    const current = form.getValues("years");

                                    if (selected) {
                                      form.setValue(
                                        "years",
                                        current.filter((y) => y !== year),
                                        {
                                          shouldValidate: true,
                                        },
                                      );
                                    } else {
                                      form.setValue(
                                        "years",
                                        [...current, year].sort(
                                          (a, b) => b - a,
                                        ),
                                        {
                                          shouldValidate: true,
                                        },
                                      );
                                    }
                                  }}
                                >
                                  <Check
                                    className={
                                      selected
                                        ? "mr-2 size-4 opacity-100"
                                        : "mr-2 size-4 opacity-0"
                                    }
                                  />

                                  {year}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedYears.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedYears.map((year) => (
                          <Badge key={year} variant="secondary">
                            {year}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="file_path"
              render={() => (
                <FormItem>
                  <FormLabel>PDF File</FormLabel>

                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,application/pdf"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) {
                          return;
                        }

                        setPdfFile(file);
                      }}
                    />
                  </FormControl>

                  {pdfFile && (
                    <p className="text-muted-foreground text-xs">
                      Selected: {pdfFile.name}
                    </p>
                  )}

                  {!pdfFile && questionPaper?.file_path && (
                    <p className="text-muted-foreground text-xs">
                      Existing PDF attached
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving || uploading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={saving || uploading}>
                {saving || uploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    {isEdit ? "Update Question Paper" : "Create Question Paper"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
