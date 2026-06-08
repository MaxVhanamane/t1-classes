"use client";

import { AlertTriangle } from "lucide-react";

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

import type { QuestionPaper } from "@/src/app/admin/question-papers/_features/types/question-paper";

type RemoveQuestionPaperDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  questionPaper?: QuestionPaper | undefined;

  targetType: "batch" | "course";

  onConfirm: () => void;

  isPending: boolean;
};

export function RemoveQuestionPaperDialog({
  open,
  onOpenChange,
  questionPaper,
  targetType,
  onConfirm,
  isPending,
}: RemoveQuestionPaperDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="bg-destructive/10 text-destructive flex size-10 items-center justify-center rounded-full">
              <AlertTriangle className="size-5" />
            </div>

            <AlertDialogTitle>Remove Question Paper</AlertDialogTitle>
          </div>

          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to remove{" "}
                <span className="font-medium text-foreground">
                  &quot;
                  {questionPaper?.title}
                  &quot;
                </span>{" "}
                from this {targetType}?
              </p>

              <p>
                This action only detaches the question paper. The original
                question paper will remain available in the question paper
                library.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();

              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
