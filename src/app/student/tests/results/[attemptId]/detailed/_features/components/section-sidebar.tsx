"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { SectionItem } from "../hooks/use-get-sections";
import { Meta } from "./section-meta";
import { ResultSummary } from "../types/question-details.types";
import { secondsToDurationString } from "@/src/lib/helper-functions/seconds-to-duration-string";

type Props = {
  sections: SectionItem[];
  summary: ResultSummary;
  active: string | null;
  onChange: (id: string) => void;
  className?: string;
};

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function formatPercent(value: number) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
}

function getAttemptStats(summary: ResultSummary) {
  if (!summary || summary.kind !== "ok") {
    return {
      attempted: 0,
      total: 0,
      accuracy: 0,
      attemptPercent: 0,
    };
  }

  const attempted =
    summary.correctCount + summary.partialCorrectCount + summary.wrongCount;

  const total = attempted + summary.unansweredCount;

  /* Accuracy excludes partial */

  const accuracy =
    attempted === 0 ? 0 : (summary.correctCount / attempted) * 100;

  const attemptPercent = total === 0 ? 0 : (attempted / total) * 100;

  return {
    attempted,
    total,
    accuracy,
    attemptPercent,
  };
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export function SectionSidebar({
  sections,
  summary,
  active,
  onChange,
  className,
}: Props) {
  const stats = getAttemptStats(summary);

  const [open, setOpen] = useState(false);

  /* Donut math */

  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  const progress = (stats.attemptPercent / 100) * circumference;

  const totalQuestionCount = sections.reduce(
    (sum, section) => sum + (section.questionCount ?? 0),
    0,
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-muted/30 overflow-y-auto",
        className,
      )}
    >
      {/* ===================================================== */}
      {/* Sticky Summary */}
      {/* ===================================================== */}

      <div className="p-4 border-b bg-background/80 backdrop-blur sticky top-0 z-10 space-y-4 shrink-0">
        {/* Title */}

        <div>
          <div className="text-xs text-muted-foreground">Test Analysis</div>

          <div className="font-semibold leading-tight line-clamp-2">
            {summary?.test.title ?? "Loading test…"}
          </div>
        </div>

        {/* Score */}

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Total Score</div>

              <div className="text-lg font-semibold">
                {summary
                  ? `${summary.obtainedMarks} / ${summary.totalMarks}`
                  : "—"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Score %</div>

              <div className="text-lg font-semibold">
                {summary ? `${formatPercent(summary.percentage)}%` : "—"}
              </div>
            </div>
          </div>

          {summary?.performanceLabel && (
            <Badge variant="outline" className="text-xs">
              {summary.performanceLabel}
            </Badge>
          )}
        </div>

        {/* Accuracy */}

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Accuracy</span>

            <span className="font-medium">
              {formatPercent(stats.accuracy)}%
            </span>
          </div>

          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-green-500 via-yellow-500 to-red-500"
              initial={{ width: 0 }}
              animate={{
                width: `${stats.accuracy}%`,
              }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
              }}
            />
          </div>
        </div>

        {/* ===================================================== */}
        {/* Collapsible Insights */}
        {/* ===================================================== */}

        <Accordion
          type="single"
          collapsible
          value={open ? "insights" : ""}
          onValueChange={(v) => setOpen(v === "insights")}
        >
          <AccordionItem value="insights">
            <AccordionTrigger className="text-xs cursor-pointer">
              {open ? "Hide Detailed Insights" : "Show Detailed Insights"}
            </AccordionTrigger>

            <AccordionContent className="space-y-5 pt-3">
              {/* ---------------- Donut ---------------- */}

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Attempt Rate
                </div>

                <div className="flex items-center gap-4">
                  {/* Gradient Animated Donut */}

                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="-rotate-90 w-16 h-16">
                      {/* Gradient */}

                      <defs>
                        <linearGradient
                          id="donutGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="50%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>

                      {/* Background */}

                      <circle
                        cx="18"
                        cy="18"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-muted"
                      />

                      {/* Animated Progress */}

                      {open && (
                        <motion.circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="none"
                          stroke="url(#donutGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{
                            strokeDashoffset: circumference,
                          }}
                          animate={{
                            strokeDashoffset: circumference - progress,
                          }}
                          transition={{
                            duration: 0.9,
                            ease: "easeOut",
                          }}
                        />
                      )}
                    </svg>

                    {/* Label */}

                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {formatPercent(stats.attemptPercent)}%
                    </div>
                  </div>

                  {/* Context */}

                  <div className="space-y-1">
                    <div className="text-sm font-semibold">
                      {stats.attempted} /{stats.total}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Questions Attempted
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance */}

              <div className="flex flex-wrap gap-2">
                {summary?.rank && (
                  <Badge variant="outline">Rank #{summary.rank}</Badge>
                )}

                <Badge variant="outline">
                  Total Sections : {sections.length}{" "}
                </Badge>

                <Badge variant="outline">
                  Total Questions : {totalQuestionCount}
                </Badge>
              </div>
              <div className="rounded-xl border bg-muted/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Time Spent Answering
                  </span>

                  <span className="text-base font-semibold">
                    {secondsToDurationString(summary?.activeTimeSeconds ?? 0)}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Combined across all sections. Includes only questions where an
                  answer was submitted.
                </p>
              </div>
              {/* Stats */}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Stat
                  label="Correct"
                  value={summary?.correctCount}
                  color="text-green-500"
                />

                <Stat
                  label="Partially Correct"
                  value={summary?.partialCorrectCount}
                  color="text-yellow-500"
                />

                <Stat
                  label="Incorrect"
                  value={summary?.wrongCount}
                  color="text-rose-500"
                />

                <Stat
                  label="Unanswered"
                  value={summary?.unansweredCount}
                  color="text-muted-foreground"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* ===================================================== */}
      {/* Sections List */}
      {/* ===================================================== */}

      <div className="p-4 space-y-3">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={cn(
              "w-full text-left rounded-2xl border transition-all p-4 space-y-2 cursor-pointer",
              "hover:bg-muted/60",
              active === s.id
                ? "bg-secondary border-gray-400 dark:border-secondary"
                : "bg-background",
            )}
          >
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  Section {i + 1}
                </div>

                <Badge
                  variant="secondary"
                  className="text-xs shrink-0 whitespace-nowrap"
                >
                  {s.questionCount}{" "}
                  {s.questionCount === 1 ? "Question" : "Questions"}
                </Badge>
              </div>

              <div className="font-semibold text-sm leading-tight">
                {s.title}
              </div>

              <div className="text-xs text-muted-foreground">
                {s.subjectLabel}
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              <Meta label="Marks" value={`+${s.fullMarks}`} tone="positive" />

              {s.negativeMarks !== 0 && (
                <Meta
                  label="Negative"
                  value={String(s.negativeMarks)}
                  tone="negative"
                />
              )}

              {s.partialMarks && (
                <Meta label="Partial" value="Available" tone="warning" />
              )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ---------------------------------- */
/* Small Components */
/* ---------------------------------- */

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | undefined;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-background px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>

      <div className={cn("mt-2 text-2xl font-bold tracking-tight", color)}>
        {value ?? "—"}
      </div>
    </div>
  );
}
