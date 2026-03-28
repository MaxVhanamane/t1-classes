"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { FileText } from "lucide-react";

import {
  addPdfFormSchema,
  AddPdfFormInput,
  MAX_PDF_SIZE_MB,
} from "../../zod-schema/pdf.schema";
import { toast } from "sonner";
import { createPdf } from "../../actions/topic/pdf/create-pdf";
import { useR2Upload } from "@/src/hooks/use-r2-upload";

interface Props {
  courseId: string;
  topicId: string;
}

export function AddPdfDialog({ courseId, topicId }: Props) {
  const { uploadFile } = useR2Upload();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AddPdfFormInput>({
    resolver: zodResolver(addPdfFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      durationMinutes: "",
      isFreePreview: false,
    },
  });

  async function onSubmit(data: AddPdfFormInput) {
    if (loading) return;

    setLoading(true);

    let uploadedPath: string | null = null;

    try {
      /* Validate file */

      if (!data.file) {
        throw new Error("Please select a PDF file");
      }

      if (
        data.file.type !== "application/pdf" &&
        !data.file.name.toLowerCase().endsWith(".pdf")
      ) {
        throw new Error("Only PDF files are allowed");
      }

      if (data.file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
        throw new Error(`PDF must be smaller than ${MAX_PDF_SIZE_MB}MB`);
      }

      /* Upload to R2 */

      const upload = await uploadFile({
        file: data.file,
        assetType: "course_pdf",
        courseId,
        topicId,
      });

      uploadedPath = upload.key;

      /* Save DB record */

      await createPdf(courseId, topicId, uploadedPath, data);

      toast.success("PDF added", {
        description: "PDF has been added as a draft.",
      });

      setOpen(false);
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add PDF");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(value: boolean) {
    if (loading) return; // prevent closing while uploading
    setOpen(value);
    if (!value) {
      form.reset();
    }
  }

  return (
    <>
      {/* Trigger */}
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        <FileText className="mr-2 h-4 w-4" />
        Add PDF
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add PDF</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>

            {/* File */}
            <div className="space-y-2">
              <Label>PDF File</Label>
              <Input
                type="file"
                accept="application/pdf"
                disabled={loading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    form.setValue("file", file, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
              {form.formState.errors.file && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.file.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea rows={3} {...form.register("description")} />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Estimated Duration (minutes)</Label>
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
                  form.setValue("isFreePreview", v, {
                    shouldDirty: true,
                  })
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
                {loading ? "Uploading…" : "Add PDF"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
