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
import {
  AddTopicFormInput,
  addTopicFormSchema,
} from "../../zod-schema/topic.schema";
import { createTopic } from "../../actions/topic/create-topic";
import { Plus } from "lucide-react";

interface AddTopicDialogProps {
  courseId: string;
  chapterId: string;
  expandChapter: () => void;
}

export function AddTopicDialog({
  courseId,
  chapterId,
  expandChapter,
}: AddTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AddTopicFormInput>({
    resolver: zodResolver(addTopicFormSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ title: "" });
    }
  }, [open, form]);

  async function onSubmit(data: AddTopicFormInput) {
    setLoading(true);
    try {
      await createTopic(courseId, chapterId, data);

      toast.success("Topic added successfully");
      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add topic");
    } finally {
      setLoading(false);
      expandChapter();
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="
    cursor-pointer
    flex items-center gap-2
    rounded-full
    border border-dashed
    border-muted-foreground/40
    hover:border-foreground/60
    px-3
  "
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3 w-3" />
        <span className="text-xs">Topic</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Topic</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Topic title</Label>
              <Input
                placeholder="e.g. Reflection of Light"
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
                {loading ? "Adding..." : "Add Topic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
