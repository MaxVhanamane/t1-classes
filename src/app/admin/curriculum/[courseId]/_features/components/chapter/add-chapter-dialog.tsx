"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { createChapter } from "../../actions/chapter/create-chapter";
import {
  AddChapterFormInput,
  addChapterFormSchema,
} from "../../zod-schema/chapter.schema";

interface AddChapterDialogProps {
  courseId: string;
}

export function AddChapterDialog({ courseId }: AddChapterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AddChapterFormInput>({
    resolver: zodResolver(addChapterFormSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ title: "" });
    }
  }, [open, form]);
  async function onSubmit(data: AddChapterFormInput) {
    setLoading(true);

    try {
      await createChapter(courseId, data);

      toast.success("Chapter created successfully");

      form.reset();
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create chapter";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        Add Chapter
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Chapter</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Chapter title</Label>
              <Input
                placeholder="e.g. Light & Reflection"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="cursor-pointer"
                disabled={loading || !form.formState.isValid}
              >
                {loading ? "Creating..." : "Create Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
