"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { PracticeProgressBar } from "./practice-progress-bar";
import { PracticeSessionQuestion } from "../../types/practice-session.types";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { PracticeQuestionActions } from "./practice-question-actions";
import { Settings } from "lucide-react";
import {
  PopoverContent,
  PopoverTrigger,
  Popover,
} from "@/src/components/ui/popover";
import { RichTextHTMLContent } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-html-content";

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
  const [layoutMode, setLayoutMode] = useState<"fixed" | "flow">(() => {
    if (typeof window === "undefined") return "fixed";

    return (
      (localStorage.getItem("practice-layout-mode") as
        | "fixed"
        | "flow"
        | null) ?? "fixed"
    );
  });

  useEffect(() => {
    localStorage.setItem("practice-layout-mode", layoutMode);
  }, [layoutMode]);

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
  const isFixedLayout = layoutMode === "fixed";

  return (
    <div
      ref={setContainerEl}
      className="flex h-full min-h-0 flex-col overflow-hidden"
    >
      {/* PROGRESS */}
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-medium text-muted-foreground">
            Question {index + 1} of {total}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {Math.round(((index + 1) / total) * 100)}%
            </span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-72 rounded-xl p-3 ">
                <div className="space-y-3">
                  {/* HEADER */}
                  <div>
                    <h4 className="text-sm font-semibold tracking-tight">
                      Layout Style
                    </h4>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Choose how action buttons behave while solving questions.
                    </p>
                  </div>

                  {/* OPTIONS */}
                  <div className="space-y-2">
                    {/* FIXED */}
                    <button
                      type="button"
                      onClick={() => setLayoutMode("fixed")}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                        isFixedLayout
                          ? "border-primary/30 bg-primary/4"
                          : "hover:bg-muted/50",
                      )}
                    >
                      {/* RADIO */}
                      <div className="pt-0.5">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border transition",
                            isFixedLayout
                              ? "border-primary"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {isFixedLayout && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          Stable Actions
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Buttons stay fixed at the bottom for faster
                          navigation.
                        </p>
                      </div>
                    </button>

                    {/* FLOW */}
                    <button
                      type="button"
                      onClick={() => setLayoutMode("flow")}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                        !isFixedLayout
                          ? "border-primary/30 bg-primary/4"
                          : "hover:bg-muted/50",
                      )}
                    >
                      {/* RADIO */}
                      <div className="pt-0.5">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border transition",
                            !isFixedLayout
                              ? "border-primary"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {!isFixedLayout && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          Follow Content
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Buttons appear below the question for a more natural
                          reading flow.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
                  <RichTextHTMLContent content={question.question} />
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
                          <RichTextHTMLContent content={option.option_text} />
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
                        <RichTextHTMLContent
                          content={question.explanation}
                          variant="prose"
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
              {!isFixedLayout && (
                <PracticeQuestionActions
                  question={question}
                  index={index}
                  isLast={isLast}
                  reviewMode={reviewMode}
                  localSelected={localSelected}
                  selectedOptionId={selectedOptionId}
                  container={containerEl}
                  questions={questions}
                  visited={visited}
                  answers={answers}
                  markedForReview={markedForReview}
                  onPrev={onPrev}
                  onNext={onNext}
                  onSubmit={onSubmit}
                  onJump={onJump}
                  onToggleReview={onToggleReview}
                  onAnswerAndMark={onAnswerAndMark}
                  onSave={handleSave}
                  onClear={handleClear}
                />
              )}
            </div>
          </div>

          {isFixedLayout && (
            <PracticeQuestionActions
              question={question}
              index={index}
              isLast={isLast}
              reviewMode={reviewMode}
              localSelected={localSelected}
              selectedOptionId={selectedOptionId}
              container={containerEl}
              questions={questions}
              visited={visited}
              answers={answers}
              markedForReview={markedForReview}
              onPrev={onPrev}
              onNext={onNext}
              onSubmit={onSubmit}
              onJump={onJump}
              onToggleReview={onToggleReview}
              onAnswerAndMark={onAnswerAndMark}
              onSave={handleSave}
              onClear={handleClear}
            />
          )}
        </div>
      </div>
    </div>
  );
}
