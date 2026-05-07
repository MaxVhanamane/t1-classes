"use client";

import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

import { PracticeQuestionNavigatorSheet } from "./practice-question-navigator-sheet";

import { PracticeSessionQuestion } from "../../types/practice-session.types";
import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "motion/react";

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
  function handleLastQuestionFeedback() {
    if (isLast) {
      toast("This is the last question");
    }
  }
  const isMarkedForReview = markedForReview.has(question.id);

  const hasAnsweredReview = isMarkedForReview && !!answers[question.id];
  return (
    <div className="border-t bg-background pt-4 space-y-4 mb-8 sm:mb-4">
      {/* REVIEW ACTIONS */}
      {!reviewMode && (
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            onClick={() => {
              // TOGGLE REVIEW OFF
              if (isMarkedForReview && !hasAnsweredReview) {
                onToggleReview(question.id);
                return;
              }

              // PREVENT WRONG FLOW
              if (localSelected) {
                toast.error(
                  "Use 'Answer & Mark for Review' when an answer is selected",
                );

                return;
              }

              // MARK REVIEW
              onToggleReview(question.id);

              if (!isLast) {
                onNext();
              }

              if (isLast) {
                handleLastQuestionFeedback();
              }
            }}
            className={cn(
              "min-w-0 border text-xs text-foreground transition-all duration-200",

              isMarkedForReview && !hasAnsweredReview
                ? "border-purple-500/50 bg-purple-500/20 shadow-[0_0_0_1px_rgba(168,85,247,0.08)] hover:bg-purple-500/25"
                : "border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={
                  isMarkedForReview && !hasAnsweredReview
                    ? "reviewed"
                    : "default-review"
                }
                initial={{ opacity: 0, y: 5, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -5, filter: "blur(3px)" }}
                transition={{
                  duration: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-flex items-center"
              >
                {isMarkedForReview && !hasAnsweredReview
                  ? "Marked for review"
                  : "Mark for review & next"}
              </motion.span>
            </AnimatePresence>
          </Button>

          <Button
            onClick={() => {
              // TOGGLE REVIEW OFF
              if (hasAnsweredReview) {
                onToggleReview(question.id);
                return;
              }

              // VALIDATION
              if (!localSelected) {
                toast.error(
                  "Select an answer first to use 'Answer & Mark for Review'",
                );

                return;
              }

              // ANSWER + REVIEW
              onAnswerAndMark(question.id, localSelected);

              if (!isLast) {
                onNext();
              }

              if (isLast) {
                handleLastQuestionFeedback();
              }
            }}
            className={cn(
              "min-w-0 border text-xs text-foreground transition-all duration-200",

              hasAnsweredReview
                ? "border-blue-500/50 bg-blue-500/20 shadow-[0_0_0_1px_rgba(59,130,246,0.08)] hover:bg-blue-500/25"
                : "border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={
                  hasAnsweredReview
                    ? "answered-reviewed"
                    : "default-answer-review"
                }
                initial={{ opacity: 0, y: 5, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -5, filter: "blur(3px)" }}
                transition={{
                  duration: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-flex items-center"
              >
                {hasAnsweredReview
                  ? "Answer marked for review"
                  : "Answer & mark for review"}
              </motion.span>
            </AnimatePresence>
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
              onClick={() => {
                handleLastQuestionFeedback();
                onSave();
              }}
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
