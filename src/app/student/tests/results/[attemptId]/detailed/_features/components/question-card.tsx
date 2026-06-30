"use client";

import { useMemo } from "react";
import { ExplanationAccordion } from "./explanation-accordion";
import { Badge } from "@/src/components/ui/badge";
import { OptionItem } from "./option-item";
import { cn } from "@/src/lib/utils";
import { RichTextHTMLContent } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-html-content";
import { QuestionReview } from "../types/question-details.types";
import { secondsToDurationString } from "@/src/lib/helper-functions/seconds-to-duration-string";
import { BarChart3, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { format } from "date-fns";

type Props = {
  index: number;
  question: QuestionReview;
  rank: number | null;
  rankingAvailableAt: string | null;
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

function getMarksTone(isAnswered: boolean, question: QuestionReview) {
  const marks = question.marksAwarded;

  if (!isAnswered) return "unattended";

  if (marks < 0) return "incorrect";

  if (marks > 0 && !question.isCorrect) return "partial";

  if (marks > 0 && question.isCorrect) return "correct";

  return "default";
}

function getMarksBadgeClass(tone: string) {
  switch (tone) {
    case "correct":
      return `
        bg-red-200 text-foreground border-green-300
        dark:bg-green-700/70 dark:border-green-600
      `;

    case "partial":
      return `
        bg-yellow-200 text-foreground border-yellow-300
        dark:bg-yellow-700/70 dark:border-yellow-600
      `;

    case "incorrect":
      return `
        bg-red-200 text-foreground border-red-300
        dark:bg-red-700/70 dark:border-red-600
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

export function QuestionCard({
  index,
  question,
  rank,
  rankingAvailableAt,
}: Props) {
  const numerical = question.numericalMeta;

  const hasOptions = question.options.length > 0;
  const isNumerical = !hasOptions && numerical;

  const range = useMemo(() => {
    if (!numerical) return null;
    return getNumericalRange(numerical.target, numerical.tolerance);
  }, [numerical]);

  /* Marks tone */

  const isAnswered = hasOptions
    ? question.options.some((o) => o.isSelected)
    : numerical?.studentValue != null;
  const marksTone = getMarksTone(isAnswered, question);

  const topperSkipped =
    question.topperMarks === 0 && question.topperTimeSeconds === 0;

  const beatTopper =
    !question.isTopper &&
    !topperSkipped &&
    question.marksAwarded > question.topperMarks;

  const fasterThanTopper =
    !question.isTopper &&
    !topperSkipped &&
    question.marksAwarded === question.topperMarks &&
    question.timeSpentSeconds > 0 &&
    question.timeSpentSeconds < question.topperTimeSeconds;

  return (
    <div className="border rounded-2xl py-5 p-3 md:p-5 space-y-4 bg-background">
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

      {/* ================= Marks ================= */}
      <div className="flex items-center justify-between pt-1">
        <div>
          {!isAnswered ? (
            <span className="inline-flex items-center rounded-full border border-amber-300/60 bg-amber-200/50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
              Not Answered
            </span>
          ) : question.timeSpentSeconds > 0 ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Solved in:</span>

              <span className="font-semibold text-foreground">
                {secondsToDurationString(question.timeSpentSeconds)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Marks Awarded:</span>
          <Badge
            className={cn(
              "h-6 min-w-6 rounded-full px-1 flex items-center justify-center border font-medium",
              getMarksBadgeClass(marksTone),
            )}
          >
            {question.marksAwarded}
          </Badge>
        </div>
      </div>

      {rank === null ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-center">
          <BarChart3 className="mx-auto h-5 w-5 text-muted-foreground" />

          <p className="mt-2 text-sm font-medium">
            Question insights aren&apos;t available yet
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Question insights become available once rankings are published.
          </p>

          {rankingAvailableAt && (
            <Badge variant="secondary" className="mt-3">
              Available at{" "}
              {format(new Date(rankingAvailableAt), "d MMM, h:mm a")}
            </Badge>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-primary" />

              <span>
                <span className="sm:hidden">Insights</span>
                <span className="hidden sm:inline">Question Insights</span>
              </span>
            </div>

            {question.isTopper ? (
              <Badge variant="secondary" className="gap-1 rounded-full">
                <Trophy className="h-3 w-3 text-amber-500" />
                You are the Top Performer
              </Badge>
            ) : (
              (beatTopper || fasterThanTopper) && (
                <Badge variant="secondary" className="gap-1 rounded-full">
                  {beatTopper ? (
                    <>
                      <Trophy className="h-3 w-3 text-amber-500" />
                      Better than Topper
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 text-emerald-500" />
                      Faster than Topper
                    </>
                  )}
                </Badge>
              )
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* Top Performer */}
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span>Topper&apos;s Performance</span>

                {question.isTopper && (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-4 px-1.5 text-[10px]"
                  >
                    You
                  </Badge>
                )}
              </div>

              {question.isTopper ? (
                <div className="rounded-md bg-emerald-50/60 px-2 py-1.5 text-[11px] text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                  Your performance sets the benchmark.
                </div>
              ) : topperSkipped ? (
                <div className="text-[11px] text-muted-foreground">
                  The top performer didn&apos;t attempt this question.
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <span>
                    <span className="text-muted-foreground">Marks: </span>
                    <span className="font-medium">{question.topperMarks}</span>
                  </span>

                  <span>
                    <span className="text-muted-foreground">Solved in: </span>
                    <span className="font-medium">
                      {secondsToDurationString(question.topperTimeSeconds)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Class Performance */}
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Class Performance
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {question.participantCount}
                  </span>{" "}
                  {question.participantCount > 1 ? "students" : "student"} took
                  this test
                </div>

                <div className="text-xs text-muted-foreground">
                  Attempted{" "}
                  <span className="font-medium text-foreground">
                    {question.attemptedCount}
                  </span>
                  {" • "}
                  Correct{" "}
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {question.correctCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Average */}
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Average
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>
                  <span className="text-muted-foreground">Marks: </span>
                  <span className="font-medium">{question.avgMarks}</span>
                </span>

                <span>
                  <span className="text-muted-foreground">Solved in: </span>
                  <span className="font-medium">
                    {secondsToDurationString(question.avgTimeSeconds)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= Explanation ================= */}

      {question.explanation && (
        <ExplanationAccordion explanation={question.explanation} />
      )}
    </div>
  );
}
