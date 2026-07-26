"use client";

import { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";

import {
  createChapterSchema,
  CreateChapterInput,
} from "../zod/syllabus-progress.schema";
import { createChapter } from "../actions/create-chapter";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

interface CreateChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  sectionId: string;
  onSuccess: () => void;
}

export function CreateChapterDialog({
  open,
  onOpenChange,
  batchId,
  sectionId,
  onSuccess,
}: CreateChapterDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateChapterInput>({
    resolver: zodResolver(createChapterSchema),
    defaultValues: {
      batch_id: batchId,
      section_id: sectionId,
      title: "",
    },
  });

  // Reset form values whenever open state or parent IDs change
  useEffect(() => {
    if (open) {
      form.reset({
        batch_id: batchId,
        section_id: sectionId,
        title: "",
      });
    }
  }, [open, batchId, sectionId, form]);

  const onSubmit = async (values: CreateChapterInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding chapter...");

    const { error } = await callServerAction(createChapter(values));

    setIsSubmitting(false);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Chapter added successfully!", { id: toastId });
    form.reset();
    onOpenChange(false);
    onSuccess();
  };

  const onError = (errors: FieldErrors<CreateChapterInput>) => {
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
          <DialogTitle>Add New Chapter</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1">Chapter Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Physics, Chemistry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
