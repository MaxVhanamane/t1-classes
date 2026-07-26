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
import { Input } from "@/src/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";

import { editChapterTitle } from "../actions/edit-chapter-title";
import { editSectionTitle } from "../actions/edit-section-title";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

const editTitleSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title is too long"),
});

type EditTitleInput = z.infer<typeof editTitleSchema>;

interface EditTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: {
    id: string;
    title: string;
    type: "section" | "chapter";
  } | null;
  onSuccess: () => void;
}

export function EditTitleDialog({
  open,
  onOpenChange,
  target,
  onSuccess,
}: EditTitleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditTitleInput>({
    resolver: zodResolver(editTitleSchema),
    defaultValues: {
      id: "",
      title: "",
    },
  });

  useEffect(() => {
    if (open && target) {
      form.reset({
        id: target.id,
        title: target.title,
      });
    }
  }, [open, target, form]);

  const onSubmit = async (values: EditTitleInput) => {
    if (!target) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Updating title...");

    const action =
      target.type === "section"
        ? editSectionTitle({ section_id: values.id, title: values.title })
        : editChapterTitle({ chapter_id: values.id, title: values.title });

    const { error } = await callServerAction(action);

    setIsSubmitting(false);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Title updated!", { id: toastId });
    form.reset();
    onOpenChange(false);
    onSuccess();
  };

  const onError = (errors: FieldErrors<EditTitleInput>) => {
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
          <DialogTitle>
            Edit {target?.type === "section" ? "Section" : "Chapter"} Title
          </DialogTitle>
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
                  <FormLabel className="mb-1">Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
