"use client";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import {
  BarChart3,
  RotateCcw,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Brain,
} from "lucide-react";

import { motion } from "motion/react";

import { PracticeSessionQuestion } from "../../types/practice-session.types";

import { cn } from "@/src/lib/utils";
import { JSX, useEffect, useRef } from "react";
import { CountUpNumber } from "@/src/app/student/tests/results/[attemptId]/_features/components/count-up-number";
import DottedBackground from "@/src/components/dotted-background";
import confetti from "canvas-confetti";
import { SectionDivider } from "@/src/components/ui/section-divider";

type Props = {
  questions: PracticeSessionQuestion[];
  answers: Record<string, string>;
  onRetry: () => void;
  onClose: () => void;
  onReview: () => void;
  onReviewAt: (index: number) => void;
};

export function PracticeSummary({
  questions,
  answers,
  onRetry,
  onClose,
  onReview,
  onReviewAt,
}: Props) {
  const total = questions.length;
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const correct = questions.filter((q) => {
    const selected = answers[q.id];

    return q.options.find((o) => o.id === selected)?.is_correct;
  }).length;

  const answered = Object.keys(answers).length;

  const skipped = total - answered;

  const wrong = answered - correct;

  const score = Math.round((correct / total) * 100);
  const performance =
    score === 100
      ? "perfect"
      : score >= 60
        ? "good"
        : score >= 30
          ? "average"
          : "low";

  const confettiConfig = {
    low: null,

    average: {
      duration: 1200,
      particleCount: 1,
      spread: 30,

      colors: ["#93c5fd", "#c4b5fd"],
    },

    good: {
      duration: 1800,
      particleCount: 2,
      spread: 42,

      colors: ["#6ee7b7", "#93c5fd", "#c4b5fd", "#f9a8d4", "#fde68a"],
    },

    perfect: {
      duration: 2600,
      particleCount: 5,
      spread: 70,

      colors: ["#facc15", "#fde68a", "#6ee7b7", "#93c5fd", "#ffffff"],
    },
  }[performance];

  useEffect(() => {
    if (!confettiCanvasRef.current) return;

    if (!confettiConfig) return;

    const myConfetti = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const end = Date.now() + confettiConfig.duration;

    const frame = () => {
      void myConfetti({
        particleCount: confettiConfig.particleCount,
        angle: 60,
        spread: confettiConfig.spread,
        origin: { x: 0, y: 0.2 },
        colors: confettiConfig.colors,
      });

      void myConfetti({
        particleCount: confettiConfig.particleCount,
        angle: 120,
        spread: confettiConfig.spread,
        origin: { x: 1, y: 0.2 },
        colors: confettiConfig.colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [confettiConfig]);

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-6">
      <canvas
        ref={confettiCanvasRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 mx-auto w-full max-w-lg py-0"
      >
        <Card className="overflow-hidden border-none bg-transparent  pt-0">
          {/* HEADER */}
          <div className=" bg-transparent px-6 py-7 text-center relative">
            <DottedBackground className="opacity-50" />

            {/* <div className="pointer-events-none absolute inset-0 rounded-2xl dark:ring-1 dark:ring-inset dark:ring-purple-300/15"></div> */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border bg-background ">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Practice Completed
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Review your performance and revisit any question.
              </p>
            </div>

            {/* SCORE */}
            <div className="mt-7 flex justify-center ">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-10 border-primary/10 bg-primary/5 shadow-inner overflow-hidden">
                <div className="text-center">
                  <div className="text-4xl font-bold tracking-tight">
                    <CountUpNumber value={score} start />%
                  </div>

                  <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Score
                  </div>
                </div>
              </div>
            </div>

            {/* PERFORMANCE TEXT */}
            <div className="mt-5">
              <p className="text-base font-semibold">
                {performance === "perfect"
                  ? "Perfect performance"
                  : performance === "good"
                    ? "Excellent work"
                    : performance === "average"
                      ? "Good attempt"
                      : "Keep practicing"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                You answered{" "}
                <span className="font-medium text-foreground">{correct}</span>{" "}
                out of{" "}
                <span className="font-medium text-foreground">{total}</span>{" "}
                questions correctly.
              </p>
            </div>
          </div>
          <SectionDivider className="my-0" />

          {/* BODY */}
          <div className="space-y-7 px-6 py-6">
            {/* STATS */}
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Correct"
                value={correct}
                icon={CheckCircle2}
                variant="success"
              />

              <Stat
                label="Wrong"
                value={wrong}
                icon={XCircle}
                variant="error"
              />

              <Stat label="Skipped" value={skipped} icon={CircleDashed} />

              <Stat label="Total" value={total} icon={BarChart3} />
            </div>

            {/* LEARNING INSIGHT */}
            <div className="rounded-2xl border bg-muted/20 p-5">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",

                    performance === "perfect" &&
                      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",

                    performance === "good" &&
                      "border-blue-500/20 bg-blue-500/10 text-blue-600",

                    performance === "average" &&
                      "border-yellow-500/20 bg-yellow-500/10 text-yellow-600",

                    performance === "low" &&
                      "border-red-500/20 bg-red-500/10 text-red-600",
                  )}
                >
                  <Brain className="h-4 w-4 " />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Learning Insight
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {performance === "perfect" &&
                      "Excellent mastery. You’ve understood this topic very well and can confidently move forward."}

                    {performance === "good" &&
                      "You have a strong understanding of this topic. Reviewing a few mistakes can help reinforce the remaining concepts."}

                    {performance === "average" &&
                      "You understood some concepts, but a quick revision of difficult areas is recommended before moving ahead."}

                    {performance === "low" &&
                      "This topic may need another review. Revisit the lesson and explanations carefully before continuing."}
                  </p>
                </div>
              </div>
            </div>

            {/* QUESTION REVIEW */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Question Review</h3>

                <p className="text-xs text-muted-foreground">
                  Tap a question to review
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3">
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {questions.map((q, index) => {
                    const selected = answers[q.id];

                    const isCorrect = q.options.find(
                      (o) => o.id === selected,
                    )?.is_correct;

                    let styles = "bg-muted/40 border-border";

                    if (!selected) {
                      styles = "bg-slate-500/10 border-slate-500/20";
                    } else if (isCorrect) {
                      styles = "bg-emerald-500/10 border-emerald-500/20";
                    } else {
                      styles = "bg-red-500/10 border-red-500/20";
                    }

                    return (
                      <Button
                        key={q.id}
                        variant="ghost"
                        onClick={() => onReviewAt(index)}
                        className={cn(
                          "h-10 w-10  border text-xs font-semibold text-foreground",
                          "transition-all hover:scale-[1.03] active:scale-[0.98]",
                          styles,
                        )}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>

                {/* LEGEND */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
                  <Legend
                    label="Correct"
                    className="bg-emerald-500/10 border-emerald-500/20"
                  />

                  <Legend
                    label="Incorrect"
                    className="bg-red-500/10 border-red-500/20"
                  />

                  <Legend
                    label="Skipped"
                    className="bg-slate-500/10 border-slate-500/20"
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="space-y-3 pt-1">
              <Button size="lg" className="w-full" onClick={onReview}>
                <Eye className="mr-2 h-4 w-4" />
                Review Answers
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={onRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>

                <Button variant="secondary" onClick={onClose}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  variant = "neutral",
}: {
  label: string;
  value: number;
  icon: JSX.ElementType;
  variant?: "success" | "error" | "neutral";
}) {
  const styles = {
    success: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      border: "border-emerald-500/20",
      icon: "text-emerald-500",
    },

    error: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-500/20",
      icon: "text-red-500",
    },

    neutral: {
      bg: "bg-muted/40",
      text: "text-foreground",
      border: "border-border",
      icon: "text-muted-foreground",
    },
  }[variant];

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4 relative ",
        styles.bg,
        styles.border,
      )}
    >
      <DottedBackground className="opcity-50" />
      <div className="flex items-start justify-between ">
        <div>
          <div className={cn("text-2xl font-bold tracking-tight", styles.text)}>
            {value}
          </div>

          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>

        <div
          className={cn(
            "rounded-md border bg-background/70 p-1.5",
            styles.icon,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-1.5 ">
      <span className={cn("h-3 w-3 rounded border", className)} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
