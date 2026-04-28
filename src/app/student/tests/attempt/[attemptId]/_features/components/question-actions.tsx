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
import { useAttemptState } from "../hooks/use-attempt-state";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { useMemo } from "react";
import DottedBackground from "@/src/components/dotted-background";

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
  attemptId: string;
  sections: Section[];
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
  attemptId,
  sections,
}: Props) {
  const { state } = useAttemptState(attemptId, []);
  const counts = useMemo(() => {
    const summary = {
      total: 0,
      answered: 0,
      answered_review: 0,
      not_answered_review: 0,
      not_answered: 0,
    };

    summary.total = sections.reduce(
      (acc, section) => acc + section.questions.length,
      0,
    );

    const stateMap = new Map(state.map((item) => [item.questionId, item]));

    for (const section of sections) {
      for (const question of section.questions) {
        const item = stateMap.get(question.id);

        if (!item) {
          summary.not_answered++;
          continue;
        }

        const hasAnswer =
          item.answer !== null &&
          item.answer !== undefined &&
          item.answer !== "";

        const marked = item.markedForReview;

        if (hasAnswer && marked) {
          summary.answered_review++;
        } else if (hasAnswer) {
          summary.answered++;
        } else if (marked) {
          summary.not_answered_review++;
        } else {
          summary.not_answered++;
        }
      }
    }

    return summary;
  }, [sections, state]);

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
          <AlertDialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden max-h-[90dvh] overflow-y-auto">
            <div className="p-4 py-6 space-y-6">
              <AlertDialogHeader className="space-y-2">
                <AlertDialogTitle className="text-xl font-semibold tracking-tight">
                  Ready to Submit Test?
                </AlertDialogTitle>

                <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  Review your progress below. Once submitted, answers cannot be
                  changed.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="Total" value={counts.total} />
                <SummaryCard label="Answered" value={counts.answered} />
                <SummaryCard
                  label="Answered + Review"
                  value={counts.answered_review}
                />
                <SummaryCard
                  label="Not Answered + Review"
                  value={counts.not_answered_review}
                />
                <SummaryCard label="Not Answered" value={counts.not_answered} />
              </div>

              {/* warning */}
              {/* {(counts.not_answered > 0 || counts.not_visited > 0) && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  You still have unanswered or review-marked questions. You may
                  review them before submitting.
                </div>
              )} */}

              <AlertDialogFooter className="pt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  onClick={onSubmit}
                  className="bg-destructive text-white"
                >
                  Submit Test
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  const glowClass =
    label === "Answered"
      ? "bg-green-500/40 dark:bg-green-600/20"
      : label === "Review"
        ? "bg-purple-500/40 dark:bg-purple-600/20"
        : label === "Answered + Review"
          ? "bg-teal-500/40 dark:bg-teal-600/20"
          : label === "Not Answered"
            ? "bg-yellow-500/40 dark:bg-yellow-600/20"
            : "bg-slate-500/40 dark:bg-slate-600/20";

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-xl
        border
        bg-background
        px-4
        py-3
      "
    >
      {/* subtle right glow */}
      <div
        className={`
          pointer-events-none
          absolute
          right-0
          top-1/2
          h-14
          w-14
          -translate-y-1/2
          rounded-full
          blur-2xl
          ${glowClass}
        `}
      />

      <DottedBackground className="opacity-50" />

      <div className="relative z-10">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </p>

        <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
