"use client";

import { Button } from "@/src/components/ui/button";
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
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        {/* SAVE & NEXT — Answered (Green) */}
        <Button
          disabled={disabled}
          className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          onClick={onSaveAndNext}
        >
          <Save className="mr-2 h-4 w-4 shrink-0" />
          Save & Next
        </Button>

        {/* CLEAR — Neutral */}
        <Button
          disabled={disabled}
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onClear}
        >
          <X className="mr-2 h-4 w-4 shrink-0" />
          Clear Response
        </Button>

        {/* SAVE & MARK — Answered + Review (Teal) */}
        <Button
          disabled={disabled}
          className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={onSaveAndMark}
        >
          <Flag className="mr-2 h-4 w-4 shrink-0" />
          Save & Mark for Review
        </Button>

        {/* MARK & NEXT — Review (Purple) */}
        <Button
          disabled={disabled}
          className="w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          onClick={onMarkAndNext}
        >
          <Flag className="mr-2 h-4 w-4 shrink-0" />
          Mark for Review & Next
        </Button>
      </div>

      {/* NAV + SUBMIT */}
      <div className="grid grid-cols-1 gap-2 border-t pt-3 sm:flex sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isFirst || disabled}
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
            Back
          </Button>

          <Button
            variant="outline"
            disabled={isLast || disabled}
            onClick={onNext}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </div>

        {/* SUBMIT — Destructive */}
        <Button
          disabled={disabled}
          variant="destructive"
          className="w-full sm:w-auto sm:min-w-40"
          onClick={onSubmit}
        >
          <Send className="mr-2 h-4 w-4 shrink-0" />
          Submit Test
        </Button>
      </div>
    </div>
  );
}
