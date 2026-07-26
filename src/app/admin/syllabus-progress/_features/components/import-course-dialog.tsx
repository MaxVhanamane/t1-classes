"use client";

import { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { importCourse } from "../actions/import-course";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

const localImportSchema = z.object({
  batch_id: z.string().uuid(),
  section_id: z.string().uuid(),
  course_id: z.string().min(1, "Please select a course"),
});

type LocalImportInput = z.infer<typeof localImportSchema>;

interface CourseOption {
  id: string;
  title: string;
}

interface ImportCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  sectionId: string;
  courses: CourseOption[];
  onSuccess: () => void;
}

export function ImportCourseDialog({
  open,
  onOpenChange,
  batchId,
  sectionId,
  courses,
  onSuccess,
}: ImportCourseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LocalImportInput>({
    resolver: zodResolver(localImportSchema),
    defaultValues: {
      batch_id: batchId,
      section_id: sectionId,
      course_id: "",
    },
  });

  // Reset form states whenever open or dependency IDs change
  useEffect(() => {
    if (open) {
      form.reset({
        batch_id: batchId,
        section_id: sectionId,
        course_id: "",
      });
    }
  }, [open, batchId, sectionId, form]);

  const onSubmit = async (values: LocalImportInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Importing chapters...");

    const { error } = await callServerAction(importCourse(values));

    setIsSubmitting(false);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Chapters imported successfully!", { id: toastId });
    form.reset();
    onOpenChange(false);
    onSuccess();
  };

  const onError = (errors: FieldErrors<LocalImportInput>) => {
    const message = extractFirstErrorMessage(errors);
    toast.dismiss();
    toast.error(message ?? "Please fix the form errors");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md bg-card"
      >
        <DialogHeader>
          <DialogTitle>Import Chapters</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1">Master Course</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course to pull chapters from" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
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
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Importing..." : "Import Chapters"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
