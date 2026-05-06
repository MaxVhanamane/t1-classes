"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { PracticeProgressBar } from "./practice-progress-bar";
import { PracticeSessionQuestion } from "../../types/practice-session.types";
import { RichTextRenderer } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-renderer";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { PracticeQuestionNavigatorSheet } from "./practice-question-navigator-sheet";

type Props = {
  question: PracticeSessionQuestion;
  index: number;
  total: number;
  visited: Set<string>;
  questions: PracticeSessionQuestion[];
  answers: Record<string, string>;
  markedForReview: Set<string>;

  selectedOptionId?: string;

  onSelect: (optionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onAnswerAndMark: (questionId: string, optionId: string) => void;

  onJump: (index: number) => void;
  onToggleReview: (id: string) => void;

  reviewMode?: boolean;
};

export function PracticeQuestionView({
  question,
  index,
  total,
  questions,
  answers,
  markedForReview,
  selectedOptionId,
  onSelect,
  onNext,
  onPrev,
  onSubmit,
  onJump,
  visited,
  onToggleReview,
  onAnswerAndMark,
  reviewMode = false,
}: Props) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [localSelected, setLocalSelected] = useState<string | null>(
    selectedOptionId ?? null,
  );
  const selected = localSelected;
  function handleSave() {
    if (!localSelected) return;
    onSelect(localSelected);
  }

  function handleClear() {
    setLocalSelected(null);
    onSelect(""); // removes answer
  }

  useEffect(() => {
    setLocalSelected(selectedOptionId ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const isLast = index === total - 1;

  return (
    <div
      ref={setContainerEl}
      className="flex h-full min-h-0 flex-col overflow-hidden"
    >
      {/* PROGRESS */}
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>
            Question {index + 1} of {total}
          </span>

          <span>{Math.round(((index + 1) / total) * 100)}%</span>
        </div>

        <PracticeProgressBar current={index} total={total} />
      </div>
      <div className="flex-1 overflow-hidden px-4 pt-4">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
            <div className="space-y-6 pb-6">
              {/* QUESTION */}
              <div className="flex gap-3 items-start">
                <span className="font-semibold">{index + 1}.</span>
                <div className="text-lg font-semibold">
                  <RichTextRenderer content={question.question} />
                </div>
              </div>

              {/* OPTIONS */}
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = selected === option.id;
                  const isCorrect = option.is_correct;

                  const showCorrect = reviewMode && isCorrect;
                  const showYourAnswer = reviewMode && isSelected;

                  return (
                    <div key={option.id} className="relative">
                      {/* Animated Badges */}
                      <AnimatePresence>
                        {reviewMode && (showCorrect || showYourAnswer) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{
                              type: "tween",
                              ease: "easeOut",
                              duration: 0.15,
                            }}
                            className="absolute -top-2 right-2 z-10 flex gap-1"
                          >
                            {showCorrect && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white bg-emerald-500">
                                Correct
                              </span>
                            )}

                            {showYourAnswer && (
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-medium text-white",
                                  isCorrect ? "bg-blue-500" : "bg-red-500",
                                )}
                              >
                                Your answer
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <label
                        className={cn(
                          "flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition",
                          "bg-background border-border hover:bg-muted/50",

                          // normal select
                          isSelected &&
                            !reviewMode &&
                            "border-primary bg-primary/5",

                          // review styles
                          showCorrect &&
                            "border-green-300 bg-green-50/60 dark:border-green-800 dark:bg-green-950/20",
                          showYourAnswer &&
                            !isCorrect &&
                            "border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-950/20",

                          // dim others
                          reviewMode &&
                            !isSelected &&
                            !isCorrect &&
                            "opacity-60",
                        )}
                      >
                        {/* Radio */}
                        <div className="pt-1">
                          <div
                            className={cn(
                              "h-4 w-4 rounded-full border flex items-center justify-center transition",
                              isSelected
                                ? "border-primary"
                                : "border-muted-foreground",
                            )}
                          >
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>

                        {/* Hidden input */}
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={isSelected}
                          onChange={() => setLocalSelected(option.id)}
                          disabled={reviewMode}
                          className="sr-only"
                        />

                        {/* Content */}
                        <div className="flex gap-2">
                          <span className="w-6 font-medium">
                            {option.option_label}.
                          </span>
                          <RichTextRenderer content={option.option_text} />
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* NOT ATTEMPTED MESSAGE (IMPROVED) */}
              {reviewMode && !selected && (
                <div className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/40">
                  You did not attempt this question.
                </div>
              )}
              {/* EXPLANATION (ACCORDION) */}
              {reviewMode && question.explanation && (
                <div className="mt-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem
                      value="explanation"
                      className="bg-muted-soft rounded-md px-3"
                    >
                      <AccordionTrigger className="text-sm font-medium">
                        Explanation
                      </AccordionTrigger>

                      <AccordionContent className="pt-2 text-sm text-muted-foreground">
                        <RichTextRenderer content={question.explanation} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="border-t bg-background pt-4 space-y-4 mb-4">
            {!reviewMode && (
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  onClick={() => {
                    if (localSelected) {
                      toast.error(
                        "Use 'Answer & Mark for Review' when an answer is selected",
                      );
                      return;
                    }
                    onToggleReview(question.id);
                    if (!isLast) onNext();
                  }}
                  className="min-w-0 border border-purple-500/40 bg-purple-500/10 text-foreground hover:bg-purple-500/20 text-xs"
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

                    onAnswerAndMark(question.id, localSelected!);
                    if (!isLast) onNext();
                  }}
                  className="min-w-0 border border-blue-500/40 bg-blue-500/10 text-foreground hover:bg-blue-500/20 text-xs"
                >
                  Answer & Mark for review
                </Button>
              </div>
            )}

            {/* Navigation + Submit */}
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
                container={containerEl}
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
                  onClick={handleClear}
                  disabled={!localSelected && !selectedOptionId}
                  className="w-full text-xs"
                >
                  Clear
                </Button>

                {isLast ? (
                  <Button
                    onClick={handleSave}
                    disabled={!localSelected}
                    className="w-full text-xs"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleSave();
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
                  className="w-full bg-red-600 text-white hover:text-white hover:bg-red-500"
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
