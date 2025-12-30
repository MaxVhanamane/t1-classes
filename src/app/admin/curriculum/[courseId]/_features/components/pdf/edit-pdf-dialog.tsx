"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, FileText } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";
import { PdfUnit } from "../../types/course-unit.types";
import { createClient } from "@/src/lib/supabase/supabase-client";
import { updatePdfUnit } from "../../actions/topic/pdf/update-pdf";
import {
  EditPdfFormInput,
  editPdfFormSchema,
} from "../../zod-schema/pdf.schema";

interface Props {
  pdf: PdfUnit;
  courseId: string;
  topicId: string;
}

export function EditPdfDialog({ pdf, courseId, topicId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<EditPdfFormInput>({
    resolver: zodResolver(editPdfFormSchema),
    mode: "onChange",
    defaultValues: {
      title: pdf.title,
      description: pdf.description ?? "",
      durationMinutes: pdf.duration_minutes ? String(pdf.duration_minutes) : "",
      isFreePreview: pdf.is_free_preview,
      file: undefined,
    },
  });

  const selectedFile = form.watch("file");

  async function onSubmit(data: EditPdfFormInput) {
    if (loading) return;
    setLoading(true);

    let newFilePath: string | undefined;

    try {
      /**
       * 1. Upload new file if replaced
       */
      if (data.file) {
        newFilePath = `courses/${courseId}/topics/${topicId}/${crypto.randomUUID()}-${
          data.file.name
        }`;

        const { error } = await supabase.storage
          .from("course-pdfs")
          .upload(newFilePath, data.file, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (error) throw new Error(error.message);
      }

      /**
       * 2. Update DB
       */
      await updatePdfUnit(courseId, topicId, pdf.id, {
        form: data,
        newFilePath,
      });

      toast.success("PDF updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      form.reset();
    }
  }

  return (
    <>
      {/* Trigger (dropdown-friendly) */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Edit PDF
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit PDF</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>

            {/* Replace file */}
            <div className="space-y-2">
              <Label>Replace PDF (optional)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  form.setValue("file", e.target.files?.[0], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  New file selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...form.register("description")} rows={3} />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Estimated duration (minutes)</Label>
              <Input
                inputMode="numeric"
                {...form.register("durationMinutes")}
              />
            </div>

            <Separator />

            {/* Free preview */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Free preview</p>
                <p className="text-xs text-muted-foreground">
                  Allow students to view before enrolling
                </p>
              </div>
              <Switch
                checked={form.watch("isFreePreview")}
                onCheckedChange={(v) =>
                  form.setValue("isFreePreview", v, { shouldDirty: true })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!form.formState.isValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
