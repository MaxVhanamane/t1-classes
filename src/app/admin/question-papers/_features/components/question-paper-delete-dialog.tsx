"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteQuestionPaper } from "../actions/delete-question-paper";

import { QuestionPaper } from "../types/question-paper";

import { questionPaperQueryKeys } from "../constants/query-keys";

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

type QuestionPaperDeleteDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  questionPaper?: QuestionPaper;
};

export function QuestionPaperDeleteDialog({
  open,
  onOpenChange,
  questionPaper,
}: QuestionPaperDeleteDialogProps) {
  const queryClient = useQueryClient();

  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!questionPaper) {
      return;
    }

    const toastId = toast.loading("Deleting question paper...");

    try {
      setDeleting(true);

      const { error } = await callServerAction(
        deleteQuestionPaper(questionPaper.id),
      );

      if (error) {
        toast.error(error, {
          id: toastId,
        });

        return;
      }

      await queryClient.invalidateQueries({
        queryKey: questionPaperQueryKeys.lists(),
      });

      toast.success("Question paper deleted", {
        id: toastId,
      });

      onOpenChange(false);
    } catch {
      toast.error("Failed to delete question paper", {
        id: toastId,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Question Paper</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-foreground">
              {questionPaper?.title}
            </span>
            .
            <br />
            <br />
            The PDF file will also be removed from storage and cannot be
            recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
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
              "Delete Question Paper"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
