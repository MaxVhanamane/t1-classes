"use client";

import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

import { PracticeQuestionNavigatorSheet } from "./practice-question-navigator-sheet";

import { PracticeSessionQuestion } from "../../types/practice-session.types";

type Props = {
  question: PracticeSessionQuestion;

  index: number;

  isLast: boolean;
  reviewMode: boolean;

  localSelected: string | null;
  selectedOptionId?: string;

  container: HTMLDivElement | null;

  questions: PracticeSessionQuestion[];
  visited: Set<string>;
  answers: Record<string, string>;
  markedForReview: Set<string>;

  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onJump: (index: number) => void;

  onToggleReview: (id: string) => void;
  onAnswerAndMark: (questionId: string, optionId: string) => void;

  onSave: () => void;
  onClear: () => void;
};

export function PracticeQuestionActions({
  question,

  index,

  isLast,
  reviewMode,

  localSelected,
  selectedOptionId,

  container,

  questions,
  visited,
  answers,
  markedForReview,

  onPrev,
  onNext,
  onSubmit,
  onJump,

  onToggleReview,
  onAnswerAndMark,

  onSave,
  onClear,
}: Props) {
  return (
    <div className="border-t bg-background pt-4 space-y-4 mb-8 sm:mb-4">
      {/* REVIEW ACTIONS */}
      {!reviewMode && (
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            onClick={() => {
              if (localSelected) {
                toast.error(
                  "Use 'Answer & Mark for Review' when an answer is selected",
                );

                return;
              }

              onToggleReview(question.id);

              if (!isLast) {
                onNext();
              }
            }}
            className="min-w-0 border border-purple-500/40 bg-purple-500/10 text-xs text-foreground hover:bg-purple-500/20"
          >
            Mark for review & next
          </Button>

          <Button
            onClick={() => {
              if (!localSelected) {
                toast.error(
                  "Select an answer first to use 'Answer & Mark for Review'",
                );

                return;
              }

              onAnswerAndMark(question.id, localSelected);

              if (!isLast) {
                onNext();
              }
            }}
            className="min-w-0 border border-blue-500/40 bg-blue-500/10 text-xs text-foreground hover:bg-blue-500/20"
          >
            Answer & Mark for review
          </Button>
        </div>
      )}

      {/* TOP ROW */}
      <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={index === 0}
          className="w-full text-xs"
        >
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={isLast}
          className="w-full text-xs"
        >
          Next
        </Button>

        <PracticeQuestionNavigatorSheet
          container={container}
          reviewMode={reviewMode}
          index={index}
          questions={questions}
          visited={visited}
          answers={answers}
          markedForReview={markedForReview}
          onJump={onJump}
        />
      </div>

      {/* BOTTOM ROW */}
      {!reviewMode && (
        <div className="grid grid-cols-[0.9fr_1.4fr_1fr] gap-2">
          <Button
            variant="outline"
            onClick={onClear}
            disabled={!localSelected && !selectedOptionId}
            className="w-full text-xs"
          >
            Clear
          </Button>

          {isLast ? (
            <Button
              onClick={onSave}
              disabled={!localSelected}
              className="w-full text-xs"
            >
              Save
            </Button>
          ) : (
            <Button
              onClick={() => {
                onSave();
                onNext();
              }}
              disabled={!localSelected}
              className="w-full text-xs"
            >
              Save & Next
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={onSubmit}
            className="w-full bg-red-600 text-white hover:bg-red-500 hover:text-white"
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}
