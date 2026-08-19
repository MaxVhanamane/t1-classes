"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { callServerAction } from "@/src/lib/actions/call-server-action";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { HomeworkChapter } from "../../[chapterId]/_features/types/homework";
import { homeworkQueryKeys } from "../../[chapterId]/_features/constants/query-keys";
import { deleteHomeworkChapter } from "../actions/delete-homework-chapter";

type HomeworkChapterDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter?: HomeworkChapter;
};

export function HomeworkChapterDeleteDialog({
  open,
  onOpenChange,
  chapter,
}: HomeworkChapterDeleteDialogProps) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!chapter) return;

    const toastId = toast.loading("Deleting chapter...");

    try {
      setDeleting(true);

      const { error } = await callServerAction(
        deleteHomeworkChapter(chapter.id),
      );

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: homeworkQueryKeys.chapters(),
      });

      toast.success("Chapter deleted successfully", { id: toastId });
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete chapter", { id: toastId });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(val) => {
        // Prevent closing the dialog if a delete operation is in progress
        if (!deleting) {
          onOpenChange(val);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {chapter?.chapter_name}
            </span>
            ?
            <br />
            <br />
            This will fail if there are any homework materials currently
            attached to this chapter.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Chapter"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
