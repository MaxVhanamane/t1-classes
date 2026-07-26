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
  createSectionSchema,
  CreateSectionInput,
} from "../zod/syllabus-progress.schema";
import { createSection } from "../actions/create-section";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

interface CreateSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  onSuccess: () => void;
}

export function CreateSectionDialog({
  open,
  onOpenChange,
  batchId,
  onSuccess,
}: CreateSectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSectionInput>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      batch_id: batchId,
      title: "",
    },
  });

  // Reset form values whenever open state or batchId changes
  useEffect(() => {
    if (open) {
      form.reset({
        batch_id: batchId,
        title: "",
      });
    }
  }, [open, batchId, form]);

  const onSubmit = async (values: CreateSectionInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating section...");

    const { error } = await callServerAction(
      createSection({ ...values, batch_id: batchId }),
    );

    setIsSubmitting(false);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Section created successfully!", { id: toastId });
    form.reset();
    onOpenChange(false);
    onSuccess();
  };

  const onError = (errors: FieldErrors<CreateSectionInput>) => {
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
          <DialogTitle>Add Custom Section</DialogTitle>
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
                  <FormLabel className="mb-1">Section Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Revision & Doubts, Physics Part 1"
                      {...field}
                    />
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
                {isSubmitting ? "Creating..." : "Create Section"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
