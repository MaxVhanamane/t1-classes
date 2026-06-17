"use client";

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

  return (
    <Card className="p-4 gap-0">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">Q{index + 1}.</span>

          <div className="flex flex-col gap-1">
            <RichTextHTMLContent
              content={question.questionText}
              variant="prose"
            />
          </div>
        </div>

        {!isPreview && (
          <QuestionActionsMenu
            question={question}
            onEdit={() => onEdit(question)}
            sectionId={section.id}
            testId={section.testId}
            is_locked={section.is_locked}
            dismissRecentQuestion={dismissRecentQuestion}
          />
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
                  "flex gap-2 rounded-md border px-3 py-2 text-sm transition",
                  correctOption
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-muted",
                )}
              >
                <span className="font-medium w-6">{opt.label}.</span>
                <div className="flex-1">
                  <RichTextHTMLContent content={opt.text} />
                </div>

                {correctOption && (
                  <Badge variant="success" className="ml-auto">
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
  );
}
