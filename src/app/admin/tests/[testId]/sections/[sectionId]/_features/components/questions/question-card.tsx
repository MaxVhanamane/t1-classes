"use client";

import { useState } from "react"; // <-- ADDED useState
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { TestQuestion } from "../../types/question.types";
import { TestSection } from "../../types/section.types";
import { cn } from "@/src/lib/utils";
import { CorrectAnswer } from "../../types/correct-answer.types";
import { QuestionActionsMenu } from "./question-actions-menu";
import { JSONContent } from "@tiptap/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { RichTextHTMLContent } from "./rich-text-html-content";

// --- ADDED SHADCN DIALOG IMPORTS ---
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";

interface Props {
  question: TestQuestion;
  index: number;
  section: TestSection;
  onEdit: (q: TestQuestion) => void;
  isPreview?: boolean;
  dismissRecentQuestion: () => void;
}

/* ------------------ Answer Type Guards ------------------ */

function isSingleSelect(
  answer: CorrectAnswer,
): answer is { option_id: string } {
  return typeof answer === "object" && answer !== null && "option_id" in answer;
}

function isMultiSelect(
  answer: CorrectAnswer,
): answer is { option_ids: string[] } {
  return (
    typeof answer === "object" &&
    answer !== null &&
    "option_ids" in answer &&
    Array.isArray((answer as { option_ids?: unknown }).option_ids)
  );
}

function isNumericRange(
  answer: CorrectAnswer,
): answer is { target: number; tolerance: number } {
  return (
    typeof answer === "object" &&
    answer !== null &&
    "target" in answer &&
    "tolerance" in answer &&
    typeof (answer as { target?: unknown }).target === "number" &&
    typeof (answer as { tolerance?: unknown }).tolerance === "number"
  );
}

function hasRichTextContent(
  content: JSONContent | null | undefined,
): content is JSONContent {
  if (!content || typeof content !== "object") return false;

  const nodes = content.content;

  if (!Array.isArray(nodes)) return false;

  for (const node of nodes) {
    if (!node) continue;

    if (node.type === "paragraph" && Array.isArray(node.content)) {
      for (const child of node.content) {
        if (child?.type === "text" && child.text?.trim()) {
          return true;
        }
      }
    }

    if (node.type !== "paragraph") {
      return true;
    }
  }

  return false;
}
/* ------------------ Helpers ------------------ */

function isOptionCorrect(
  answer: CorrectAnswer | null,
  optionId: string,
): boolean {
  if (!answer) return false;

  if (isSingleSelect(answer)) {
    return answer.option_id === optionId;
  }

  if (isMultiSelect(answer)) {
    return answer.option_ids.includes(optionId);
  }

  return false;
}

function formatNumericAnswer(target: number, tolerance: number) {
  if (tolerance === 0) {
    return `Exact answer: ${target}`;
  }

  const min = target - tolerance;
  const max = target + tolerance;

  return `Acceptable range: ${min} to ${max} (inclusive)`;
}

/* ------------------ Component ------------------ */
export function QuestionCard({
  question,
  index,
  section,
  onEdit,
  dismissRecentQuestion,
  isPreview = false,
}: Props) {
  const correct = question.correctAnswer;

  // =========================
  // State: Lightbox
  // =========================
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // EVENT DELEGATION: Catch clicks on any image inside the card
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      e.preventDefault();
      setFullScreenImage((target as HTMLImageElement).src);
    }
  };

  return (
    <>
      {/* ATTACHED onClick={handleImageClick} HERE */}
      <Card className="p-3 sm:p-4 gap-0" onClick={handleImageClick}>
        {/* Header */}
        <div className="flex justify-between items-start gap-2 sm:gap-4">
          <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
            <span className="font-medium shrink-0 pt-[2px]">Q{index + 1}.</span>

            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <RichTextHTMLContent
                content={question.questionText}
                variant="prose"
              />
            </div>
          </div>

          {!isPreview && (
            <div className="shrink-0 -mr-2 sm:mr-0">
              {/* -mr-2 pulls the menu slightly to the right edge on mobile to save space */}
              <QuestionActionsMenu
                question={question}
                onEdit={() => onEdit(question)}
                sectionId={section.id}
                testId={section.testId}
                is_locked={section.is_locked}
                dismissRecentQuestion={dismissRecentQuestion}
              />
            </div>
          )}
        </div>

        {/* Options OR Numerical Answer */}
        {question.options.length > 0 ? (
          <div className="grid gap-2 pt-2">
            {question.options.map((opt) => {
              const correctOption = isOptionCorrect(correct, opt.id);

              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-1.5 sm:gap-2 rounded-md border px-2.5 sm:px-3 py-2 text-sm transition",
                    correctOption
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-muted",
                  )}
                >
                  <span className="font-medium shrink-0 w-5 sm:w-6 pt-[2px]">
                    {opt.label}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <RichTextHTMLContent content={opt.text} />
                  </div>

                  {correctOption && (
                    <Badge variant="success" className="ml-auto shrink-0">
                      Correct
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        ) : isNumericRange(correct) ? (
          <div className="pt-3 text-sm text-muted-foreground flex items-center justify-start gap-2">
            <div className="font-medium text-foreground">
              {formatNumericAnswer(correct.target, correct.tolerance)}
            </div>
          </div>
        ) : null}

        {/* Explanation */}
        {hasRichTextContent(question.explanation) && (
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem
              value="explanation"
              className="rounded-md border border-border/60 bg-muted/30 px-3"
            >
              <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                Explanation
              </AccordionTrigger>

              <AccordionContent className="pb-3">
                <div className="text-sm text-foreground/90">
                  <RichTextHTMLContent content={question.explanation} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </Card>

      {/* --- LIGHTBOX DIALOG --- */}
      <Dialog
        open={!!fullScreenImage}
        onOpenChange={(open) => !open && setFullScreenImage(null)}
      >
        <DialogContent className="sm:max-w-xl w-[95vw] h-[90vh] bg-black/90 border-none shadow-none p-0 flex justify-center items-center">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>

          {fullScreenImage && (
            <img
              src={fullScreenImage}
              className="w-full h-full object-contain p-1"
              alt="Fullscreen preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
