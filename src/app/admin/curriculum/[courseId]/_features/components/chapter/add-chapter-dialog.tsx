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
    console.log("========== CLIENT: CREATE CHAPTER START ==========");
    console.log("Course ID:", courseId);
    console.log("Form Data:", data);

    setLoading(true);

    try {
      console.log("Calling createChapter server action...");

      const result = await createChapter(courseId, data);

      console.log("Server Action Response:", result);
      console.log("Response Type:", typeof result);
      console.log("Response is undefined:", result === undefined);

      toast.success("Chapter created successfully");

      console.log("Resetting form...");
      form.reset();

      console.log("Closing modal...");
      setOpen(false);

      console.log("========== CLIENT: CREATE CHAPTER SUCCESS ==========");
    } catch (err: unknown) {
      console.error("❌ CLIENT ERROR:", err);

      if (err instanceof Error) {
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Error Stack:", err.stack);
        toast.error(err.message);
      } else {
        console.error("Unknown Error:", err);
        toast.error("An unexpected response was received from the server");
      }
    } finally {
      setLoading(false);
      console.log("Loading state reset");
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
