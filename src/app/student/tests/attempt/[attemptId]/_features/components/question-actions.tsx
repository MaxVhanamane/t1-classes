"use client";

import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogOverlay,
} from "@/src/components/ui/alert-dialog";

import { ArrowLeft, ArrowRight, Flag, Save, X, Send } from "lucide-react";

type Props = {
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onClear: () => void;
  onSaveAndNext: () => void;
  onSaveAndMark: () => void;
  onMarkAndNext: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function QuestionActions({
  isFirst,
  isLast,
  onBack,
  onNext,
  onClear,
  onSaveAndNext,
  onSaveAndMark,
  onMarkAndNext,
  onSubmit,
  disabled,
}: Props) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-3 shadow-sm sm:p-4">
      {/* PRIMARY ACTIONS */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button
          disabled={disabled}
          className="w-full col-span-1 sm:w-auto bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          onClick={onSaveAndNext}
        >
          <Save className="h-4 w-4 shrink-0 hidden sm:block" />
          Save & Next
        </Button>

        <Button
          disabled={disabled}
          variant="outline"
          className="w-full col-span-1 sm:w-auto"
          onClick={onClear}
        >
          <X className="h-4 w-4 shrink-0 hidden sm:block" />
          Clear
        </Button>

        <Button
          disabled={disabled}
          className="w-full col-span-2 sm:w-auto bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={onSaveAndMark}
        >
          <Flag className="h-4 w-4 shrink-0 hidden sm:block" />
          Save & Mark for Review
        </Button>

        <Button
          disabled={disabled}
          className="w-full col-span-2 sm:w-auto bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          onClick={onMarkAndNext}
        >
          <Flag className="h-4 w-4 shrink-0 hidden sm:block" />
          Mark for Review & Next
        </Button>
      </div>

      {/* NAV + SUBMIT */}
      <div className="grid grid-cols-1 gap-2 border-t pt-3 sm:flex sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:justify-start">
          <Button
            variant="outline"
            disabled={isFirst || disabled}
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back
          </Button>

          <Button
            variant="outline"
            disabled={isLast || disabled}
            onClick={onNext}
            className="w-full sm:w-auto"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </div>

        {/* SUBMIT WITH CONFIRMATION */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={disabled}
              variant="destructive"
              className="w-full sm:w-auto sm:min-w-40"
            >
              <Send className="h-4 w-4 shrink-0" />
              Submit Test
            </Button>
          </AlertDialogTrigger>
          <AlertDialogOverlay className="backdrop-blur-xs" />
          <AlertDialogContent className="bg-card ">
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Test?</AlertDialogTitle>
              <AlertDialogDescription>
                Once you submit, you won’t be able to change your answers. Make
                sure you have reviewed all questions.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction
                onClick={onSubmit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
