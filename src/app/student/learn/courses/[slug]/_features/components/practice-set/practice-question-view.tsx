"use client";

import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { PracticeProgressBar } from "./practice-progress-bar";
import { useState } from "react";

type Option = {
  id: string;
  optionText: string;
  isCorrect: boolean;
};

type Props = {
  question: {
    id: string;
    question: string;
    explanation: string | null;
    options: Option[];
  };
  index: number;
  total: number;
  answered: boolean;
  onAnswered: (correct: boolean, selectedOptionId: string) => void;
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

  function handleSelect(option: Option) {
    if (answered) return;
    setSelectedId(option.id);
    onAnswered(option.isCorrect, option.id);
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
          {/* Question (no animation) */}
          <h2 className="text-lg font-semibold leading-relaxed cursp">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedId === option.id;
              const showCorrect = answered && option.isCorrect;
              const showIncorrect = answered && isSelected && !option.isCorrect;

              return (
                <div key={option.id} className="relative ">
                  {/* Badge with materialize animation */}
                  {(showCorrect || showIncorrect) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute -top-2 right-2 pointer-events-none"
                    >
                      <Badge
                        variant={showIncorrect ? "destructive" : undefined}
                        className={cn(showCorrect && "bg-green-600 text-white")}
                      >
                        {showCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </motion.div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    animate={{
                      opacity:
                        answered && !isSelected && !option.isCorrect ? 0.55 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                    disabled={answered}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left",
                      "bg-background transition-colors",
                      "border-border hover:bg-muted/50 cursor-pointer",
                      answered && "cursor-default"
                    )}
                  >
                    {option.optionText}
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Explanation (no height animation, no mount/unmount) */}
          <div className="relative min-h-22">
            {question.explanation && (
              <motion.div
                initial={false}
                animate={{
                  opacity: answered ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                  {question.explanation}
                </div>
              </motion.div>
            )}
          </div>

          {/* Next button */}
          <motion.div
            initial={false}
            animate={{ opacity: answered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-end pt-2 mb-4"
          >
            <Button
              className={cn(
                "cursor-pointer",
                !answered && "pointer-events-none"
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
