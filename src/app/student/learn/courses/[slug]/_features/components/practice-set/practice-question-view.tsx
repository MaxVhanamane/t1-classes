"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { PracticeProgressBar } from "./practice-progress-bar";
import { useState } from "react";
import { PracticeSessionQuestion } from "../../types/practice-session.types";
import { RichTextRenderer } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-renderer";

type Props = {
  question: PracticeSessionQuestion;
  index: number;
  total: number;
  answered: boolean;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
};

export function PracticeQuestionView({
  question,
  index,
  total,
  answered,
  onAnswered,
  onNext,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSelect(optionId: string, isCorrect: boolean) {
    if (answered) return;
    setSelectedId(optionId);
    onAnswered(isCorrect);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress */}
      <div className="px-6 pt-10">
        <PracticeProgressBar current={index} total={total} />
      </div>

      {/* Counter */}
      <div className="px-6 pt-2 text-right text-xs text-muted-foreground">
        Question {index + 1} of {total}
      </div>

      {/* Content */}
      <div className="flex flex-1 items-start justify-center px-6 pt-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Question */}
          <div className="text-lg font-semibold leading-relaxed">
            <RichTextRenderer content={question.question} />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedId === option.id;
              const isCorrect = option.is_correct;
              const showCorrect = answered && isCorrect;
              const showIncorrect = answered && isSelected && !isCorrect;

              return (
                <div key={option.id} className="relative">
                  <AnimatePresence mode="wait">
                    {(showCorrect || showIncorrect) && (
                      <motion.div
                        key={showCorrect ? "correct" : "incorrect"}
                        initial={{ opacity: 0, scale: 0.7, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: 6 }}
                        transition={{
                          type: "spring",
                          stiffness: 1000,
                          damping: 28,
                          mass: 0.9,
                        }}
                        className="absolute -top-2 right-2"
                      >
                        <motion.div transition={{ duration: 0.25 }}>
                          <Badge
                            variant={undefined}
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-medium ",
                              showCorrect &&
                                "bg-green-500 text-white border-transparent",
                              showIncorrect &&
                                "bg-red-400 text-white border-transparent",
                            )}
                          >
                            {showCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    animate={{
                      opacity: answered && !isSelected && !isCorrect ? 0.55 : 1,
                    }}
                    disabled={answered}
                    onClick={() => handleSelect(option.id, isCorrect)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left",
                      "bg-background transition-colors",
                      "border-border hover:bg-muted/50 cursor-pointer",
                      answered && "cursor-default",
                    )}
                  >
                    <div className="flex gap-2">
                      <span className="font-medium w-6">
                        {option.option_label}.
                      </span>
                      <RichTextRenderer content={option.option_text} />
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <motion.div
              initial={false}
              animate={{ opacity: answered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border bg-red/40 p-4 text-sm"
            >
              <RichTextRenderer content={question.explanation} />
            </motion.div>
          )}

          {/* Next Button */}
          <motion.div
            initial={false}
            animate={{ opacity: answered ? 1 : 0 }}
            className="flex justify-end pt-2 mb-4"
          >
            <Button
              className={cn(
                "cursor-pointer",
                !answered && "pointer-events-none",
              )}
              onClick={onNext}
            >
              Next
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
