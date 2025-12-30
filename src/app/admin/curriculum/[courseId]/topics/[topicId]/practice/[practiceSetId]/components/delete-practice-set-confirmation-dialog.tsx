"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { deletePracticeSet } from "../../../actions/practice-set/delete-practice-set";

interface Props {
  courseId: string;
  topicId: string;
  practiceSetId: string;
}

export function DeletePracticeSetDialog({
  courseId,
  topicId,
  practiceSetId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    setLoading(true);

    try {
      await deletePracticeSet({
        courseId,
        topicId,
        practiceSetId,
      });

      toast.success("Practice set deleted");
      setOpen(false); //  close ONLY after success
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete practice set"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-destructive cursor-pointer justify-start"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete practice set?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this practice set and all its
            questions. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={loading}>
            Cancel
          </AlertDialogCancel>

          {/* DO NOT let Radix auto-close */}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); //  stop auto close
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
