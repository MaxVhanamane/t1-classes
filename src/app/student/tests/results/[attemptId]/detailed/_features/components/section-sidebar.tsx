"use client";

import { useState, useMemo } from "react";
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
  summary: ResultSummary | null;
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

function getAttemptStats(summary: ResultSummary | null) {
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

  const [scoreOpen, setScoreOpen] = useState(true); // Title/Score/Accuracy accordion — open by default
  const [open, setOpen] = useState(false); // existing Detailed Insights accordion

  /* Donut math */
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = (stats.attemptPercent / 100) * circumference;

  const totalQuestionCount = sections.reduce(
    (sum, section) => sum + (section.questionCount ?? 0),
    0,
  );

  /* Group Sections by Subject */
  const groupedSections = useMemo(() => {
    return sections.reduce(
      (acc, section) => {
        const subject = section.subjectLabel || "General";
        let group = acc.find((g) => g.subject === subject);
        if (!group) {
          group = { subject, items: [] };
          acc.push(group);
        }
        group.items.push(section);
        return acc;
      },
      [] as { subject: string; items: SectionItem[] }[],
    );
  }, [sections]);

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
        {/* ===================================================== */}
        {/* Title (trigger) + Score/Accuracy (collapsible) */}
        {/* ===================================================== */}

        <Accordion
          type="single"
          collapsible
          value={scoreOpen ? "score" : ""}
          onValueChange={(v) => setScoreOpen(v === "score")}
        >
          <AccordionItem value="score" className="border-none">
            <AccordionTrigger className="p-0 hover:no-underline cursor-pointer [&>svg]:text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
              <div className="text-left">
                <div className="text-xs text-muted-foreground">
                  Test Analysis
                </div>
                <div className="font-semibold leading-tight line-clamp-2">
                  {summary?.test.title ?? "Loading test…"}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-4 pt-4">
              {/* Score */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Total Score
                    </div>
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ===================================================== */}
        {/* Collapsible Insights (unchanged) */}
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
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="-rotate-90 w-16 h-16">
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

                      <circle
                        cx="18"
                        cy="18"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-muted"
                      />

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

                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {formatPercent(stats.attemptPercent)}%
                    </div>
                  </div>

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
      {/* Sections List (Grouped by Subject) */}
      {/* ===================================================== */}

      <div className="p-2 sm:p-4 space-y-8">
        {groupedSections.map((group) => (
          <div key={group.subject} className="space-y-3">
            {/* Subject Header */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                {group.subject}
              </h3>
            </div>

            {/* Subject's Sections */}
            <div className="space-y-3">
              {group.items.map((s, index) => {
                const isActive = active === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => onChange(s.id)}
                    className={cn(
                      "relative w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer p-4 space-y-2",
                      isActive
                        ? "bg-primary/3 border-primary/30 ring-1 ring-primary/20 shadow-sm"
                        : "bg-background border-border hover:bg-muted/50 hover:border-foreground/20",
                    )}
                  >
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={cn(
                            "text-xs font-medium",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          Section {index + 1}
                        </div>

                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className="text-[10px] shrink-0 whitespace-nowrap"
                        >
                          {s.questionCount}{" "}
                          {s.questionCount === 1 ? "Question" : "Questions"}
                        </Badge>
                      </div>

                      <div className="font-semibold text-xs sm:text-sm leading-tight pr-2">
                        {s.title}
                      </div>

                      {/* Kept subject label inside the card as requested */}
                      <div className="text-xs text-muted-foreground">
                        {s.subjectLabel}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                      <Meta
                        label="Marks"
                        value={`+${s.fullMarks}`}
                        tone="positive"
                      />

                      {s.negativeMarks !== 0 && (
                        <Meta
                          label="Negative"
                          value={String(s.negativeMarks)}
                          tone="negative"
                        />
                      )}

                      {s.partialMarks && (
                        <Meta
                          label="Partial"
                          value="Available"
                          tone="warning"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
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
