"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useR2Upload } from "@/src/hooks/use-r2-upload";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

import {
  homeworkMaterialSchema,
  HomeworkMaterialFormValues,
} from "../zod/homework-material.schema";
import { HomeworkMaterial } from "../types/homework";
import { homeworkQueryKeys } from "../constants/query-keys";
import {
  HOMEWORK_DIFFICULTIES,
  HOMEWORK_TYPES,
} from "../constants/homework.constants";

import { createHomeworkMaterial } from "../actions/create-homework-material";
import { updateHomeworkMaterial } from "../actions/update-homework-material";

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
import { Textarea } from "@/src/components/ui/textarea";

type HomeworkMaterialDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: HomeworkMaterial;
};

export function HomeworkMaterialDialog({
  open,
  onOpenChange,
  material,
}: HomeworkMaterialDialogProps) {
  const { chapterId } = useParams() as { chapterId: string };
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useR2Upload();

  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [solutionPdfFile, setSolutionPdfFile] = useState<File | null>(null);

  const isEdit = !!material;

  const defaultValues: HomeworkMaterialFormValues = {
    chapter_id: chapterId,
    title: "",
    description: null,
    homework_type: "dpp",
    difficulty: "mixed",
    file_path: "",
    file_size: 0,
    solution_file_path: null,
    solution_file_size: null,
  };

  const form = useForm<HomeworkMaterialFormValues>({
    resolver: zodResolver(homeworkMaterialSchema),
    defaultValues: material
      ? {
          chapter_id: material.chapter_id,
          title: material.title,
          description: material.description,
          homework_type: material.homework_type,
          difficulty: material.difficulty,
          file_path: material.file_path,
          file_size: material.file_size,
          solution_file_path: material.solution_file_path,
          solution_file_size: material.solution_file_size,
        }
      : defaultValues,
  });

  useEffect(() => {
    if (!open) {
      setPdfFile(null);
      setSolutionPdfFile(null);
      form.reset(defaultValues);
      return;
    }

    if (material) {
      form.reset({
        chapter_id: material.chapter_id,
        title: material.title,
        description: material.description,
        homework_type: material.homework_type,
        difficulty: material.difficulty,
        file_path: material.file_path,
        file_size: material.file_size,
        solution_file_path: material.solution_file_path,
        solution_file_size: material.solution_file_size,
      });
    } else {
      setPdfFile(null);
      setSolutionPdfFile(null);
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, material, form]);

  const dialogTitle = isEdit
    ? "Edit Homework Material"
    : "Upload Homework Material";

  const onSubmit = form.handleSubmit(
    async (values) => {
      const toastId = toast.loading(
        material ? "Updating material..." : "Uploading material...",
      );

      try {
        setSaving(true);

        if (!material && !pdfFile) {
          toast.error("Please select a Question PDF", { id: toastId });
          return;
        }

        let filePath = values.file_path;
        let fileSize = values.file_size;
        let solutionFilePath = values.solution_file_path;
        let solutionFileSize = values.solution_file_size;

        if (pdfFile) {
          toast.loading("Uploading Question PDF...", { id: toastId });
          const upload = await uploadFile({
            file: pdfFile,
            assetType: "homework",
            chapterId: chapterId,
          });
          filePath = upload.key;
          fileSize = pdfFile.size;
        }

        if (solutionPdfFile) {
          toast.loading("Uploading Solution PDF...", { id: toastId });
          const solutionUpload = await uploadFile({
            file: solutionPdfFile,
            assetType: "homework_solution",
            chapterId: chapterId,
          });
          solutionFilePath = solutionUpload.key;
          solutionFileSize = solutionPdfFile.size;
        }

        const payload = {
          ...values,
          chapter_id: chapterId,
          file_path: filePath,
          file_size: fileSize,
          solution_file_path: solutionFilePath,
          solution_file_size: solutionFileSize,
        };

        if (material) {
          const { error } = await callServerAction(
            updateHomeworkMaterial(material.id, payload),
          );
          if (error) {
            toast.error(error, { id: toastId });
            return;
          }
        } else {
          const { error } = await callServerAction(
            createHomeworkMaterial(payload),
          );
          if (error) {
            toast.error(error, { id: toastId });
            return;
          }
        }

        await queryClient.invalidateQueries({
          queryKey: homeworkQueryKeys.lists(),
        });

        toast.success(
          material
            ? "Material details updated"
            : "Homework material uploaded successfully",
          { id: toastId },
        );

        onOpenChange(false);
        form.reset();
        setPdfFile(null);
        setSolutionPdfFile(null);
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
        //  FIX: Prevents closing when clicking outside the dialog
        onInteractOutside={(e) => e.preventDefault()}
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
                    <Input
                      placeholder="e.g. DPP 01: Balancing Equations"
                      {...field}
                    />
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
                      placeholder="Brief instructions or notes about this material"
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
                name="homework_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HOMEWORK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HOMEWORK_DIFFICULTIES.map((diff) => (
                          <SelectItem key={diff.value} value={diff.value}>
                            {diff.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 rounded-lg border p-4 bg-muted/20">
              {/* Column 1 Wrapper - Added min-w-0 */}
              <div className="min-w-0">
                <FormField
                  control={form.control}
                  name="file_path"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-primary">
                        Question PDF *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,application/pdf"
                          disabled={uploading}
                          // Added w-full and truncate here
                          className="w-full truncate"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) {
                              setPdfFile(null);
                              if (!material?.file_path)
                                form.setValue("file_path", "");
                              return;
                            }
                            setPdfFile(file);
                            //  FIX: Feed Zod a dummy value so it allows submission to proceed
                            form.setValue("file_path", file.name, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </FormControl>
                      {pdfFile && (
                        // Added truncate here
                        <p
                          className="text-muted-foreground text-xs truncate"
                          title={pdfFile.name}
                        >
                          Selected: {pdfFile.name}
                        </p>
                      )}
                      {!pdfFile && material?.file_path && (
                        <p className="text-muted-foreground text-xs truncate">
                          Existing PDF attached. Upload to replace.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Column 2 Wrapper - Added min-w-0 */}
              <div className="md:border-l md:border-border md:pl-4 min-w-0">
                <FormField
                  control={form.control}
                  name="solution_file_path"
                  render={() => (
                    <FormItem>
                      <FormLabel>Solution PDF (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,application/pdf"
                          disabled={uploading}
                          // Added w-full and truncate here
                          className="w-full truncate"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) {
                              setSolutionPdfFile(null);
                              if (!material?.solution_file_path)
                                form.setValue("solution_file_path", "");
                              return;
                            }
                            setSolutionPdfFile(file);
                            //  FIX: Feed Zod a dummy value so it allows submission to proceed
                            form.setValue("solution_file_path", file.name, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </FormControl>
                      {solutionPdfFile && (
                        // Added truncate here
                        <p
                          className="text-muted-foreground text-xs truncate"
                          title={solutionPdfFile.name}
                        >
                          Selected: {solutionPdfFile.name}
                        </p>
                      )}
                      {!solutionPdfFile && material?.solution_file_path && (
                        <p className="text-muted-foreground text-xs truncate">
                          Solution attached. Upload to replace.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                    {isEdit ? "Update Material" : "Upload Material"}
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
