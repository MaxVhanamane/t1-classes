"use client";

import { useMemo } from "react";
import { QuestionReview } from "@/src/app/api/tests/results/[attemptId]/sections/[sectionId]/questions/route";
import { ExplanationAccordion } from "./explanation-accordion";
import { Badge } from "@/src/components/ui/badge";
import { OptionItem } from "./option-item";
import { cn } from "@/src/lib/utils";
import { RichTextHTMLContent } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-html-content";

type Props = {
  index: number;
  question: QuestionReview;
};

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

type ExactRange = {
  type: "exact";
  value: number;
};

type ToleranceRange = {
  type: "range";
  min: number;
  max: number;
};

type NumericalRange = ExactRange | ToleranceRange;

function getNumericalRange(target: number, tolerance: number): NumericalRange {
  if (tolerance === 0) {
    return { type: "exact", value: target };
  }

  return {
    type: "range",
    min: target - tolerance,
    max: target + tolerance,
  };
}

function formatRangeText(min: number, max: number) {
  return `Any value between ${min} and ${max} (inclusive) is correct`;
}

function getMarksTone(question: QuestionReview) {
  const marks = question.marksAwarded;

  const unattended =
    (!question.options?.some((o) => o.isSelected) &&
      !question.numericalMeta?.studentValue) ||
    marks === 0;

  if (unattended) return "unattended";
  if (marks < 0) return "incorrect";
  if (marks > 0 && !question.isCorrect) return "partial";
  if (marks > 0 && question.isCorrect) return "correct";

  return "default";
}

function getMarksBadgeClass(tone: string) {
  switch (tone) {
    case "correct":
      return `
        bg-green-200 text-green-900 border-green-400
        dark:bg-green-800 dark:text-green-100 dark:border-green-600
      `;

    case "partial":
      return `
        bg-yellow-200 text-yellow-900 border-yellow-400
        dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600
      `;

    case "incorrect":
      return `
        bg-red-200 text-red-900 border-red-400
        dark:bg-red-800 dark:text-red-100 dark:border-red-600
      `;

    case "unattended":
      return `
        bg-muted text-muted-foreground border-border
      `;

    default:
      return `
        bg-muted text-foreground border-border
      `;
  }
}

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */

export function QuestionCard({ index, question }: Props) {
  const numerical = question.numericalMeta;

  const hasOptions = question.options.length > 0;
  const isNumerical = !hasOptions && numerical;

  const range = useMemo(() => {
    if (!numerical) return null;
    return getNumericalRange(numerical.target, numerical.tolerance);
  }, [numerical]);

  /* Marks tone */

  const marksTone = getMarksTone(question);

  return (
    <div className="border rounded-2xl p-5 space-y-4 bg-background">
      {/* ================= Header ================= */}

      <div className="flex items-start gap-3">
        <h3 className="font-medium flex gap-1">
          <span className="text-sm mt-0.5">Q{index}.</span>

          <RichTextHTMLContent
            content={question.questionText}
            className="text-sm "
          />
        </h3>
      </div>

      {/* ================= MCQ OPTIONS ================= */}

      {hasOptions && (
        <div className="space-y-3">
          {question.options.map((opt) => (
            <OptionItem key={opt.id} option={opt} />
          ))}
        </div>
      )}

      {/* ================= NUMERICAL ================= */}

      {isNumerical && numerical && range && (
        <div className="rounded-xl border p-4 bg-muted/30 space-y-3 text-sm">
          {/* Student Answer */}

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">Your Answer</div>

            <Badge variant="secondary">
              {numerical.studentValue ?? "Not Answered"}
            </Badge>
          </div>

          {/* Correct Answer */}
          <div
            className={cn(
              "flex gap-2",
              range.type === "exact"
                ? "items-center justify-between"
                : "flex-col sm:flex-row sm:items-center sm:justify-between",
            )}
          >
            <div className="text-muted-foreground">Correct Answer</div>

            {range.type === "exact" ? (
              <Badge
                variant="secondary"
                className="shrink-0 rounded-sm! sm:rounded-full!"
              >
                {range.value}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="max-w-full whitespace-normal text-left rounded-sm sm:rounded-full"
              >
                {formatRangeText(range.min, range.max)}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* ================= Marks (Moved Bottom) ================= */}

      <div className="flex justify-end pt-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Marks Rewarded:</span>

          <Badge
            className={cn("border font-medium", getMarksBadgeClass(marksTone))}
          >
            {question.marksAwarded}
          </Badge>
        </div>
      </div>

      {/* ================= Explanation ================= */}

      {question.explanation && (
        <ExplanationAccordion explanation={question.explanation} />
      )}
    </div>
  );
}
