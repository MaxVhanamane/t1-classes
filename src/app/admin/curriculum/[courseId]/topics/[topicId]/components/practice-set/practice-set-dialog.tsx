"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";

import {
  PracticeSetInput,
  practiceSetSchema,
} from "../../zod-schema/practice-set/practice-set";
import { createPracticeSet } from "../../actions/practice-set/create-practice-set";
import { updatePracticeSet } from "../../actions/practice-set/update-practice-set";
import { cn } from "@/src/lib/utils";

interface Props {
  courseId: string;
  topicId: string;
  mode?: "create" | "edit";
  initialData?: {
    practiceSetId: string;
    title: string;
    description: string | null;
  };
}

export function PracticeSetDialog({
  courseId,
  topicId,
  mode = "create",
  initialData,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PracticeSetInput>({
    resolver: zodResolver(practiceSetSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
    },
  });

  /**
   *  SINGLE SOURCE OF TRUTH FOR RESETTING
   */
  useEffect(() => {
    if (!open) {
      // dialog closed → hard reset
      form.reset({
        title: "",
        description: "",
      });
      return;
    }

    // dialog opened
    if (mode === "edit" && initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description ?? "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
      });
    }
  }, [open, mode, initialData, form]);

  async function onSubmit(data: PracticeSetInput) {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (mode === "edit" && initialData) {
        await updatePracticeSet({
          courseId,
          topicId,
          practiceSetId: initialData.practiceSetId,
          title: data.title.trim(),
          description: data.description?.trim() || null,
        });

        toast.success("Practice set updated");
      } else {
        await createPracticeSet(courseId, topicId, {
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
        });

        toast.success("Practice set created");
      }

      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save practice set"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={mode === "edit" ? "ghost" : "outline"}
          className={cn(
            "justify-start cursor-pointer",
            mode === "edit" ? "w-full" : "w-fit"
          )}
        >
          {mode === "edit" ? (
            <>
              <Pencil className=" h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <ClipboardList className=" h-4 w-4" />
              Add Practice
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Practice Set" : "Add Practice Set"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea rows={3} {...form.register("description")} />
          </div>

          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={!form.formState.isValid || submitting}
            >
              {submitting
                ? "Saving..."
                : mode === "edit"
                ? "Save changes"
                : "Create Practice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
