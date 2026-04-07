"use client";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { CheckCircle2, XCircle, BarChart3, RotateCcw, X } from "lucide-react";
import { motion } from "motion/react";
import { GravityConfetti } from "./gravity-confety";

type Props = {
  total: number;
  answers: Record<string, boolean>;
  onRetry: () => void;
  onClose: () => void;
};

export function PracticeSummary({ total, answers, onRetry, onClose }: Props) {
  const correct = Object.values(answers).filter(Boolean).length;
  const wrong = total - correct;

  return (
    <div className="relative h-full flex items-center justify-center px-6 overflow-hidden">
      {/* Gravity particles */}
      <GravityConfetti />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="px-6 py-7 sm:px-7 sm:py-8 text-center shadow-sm">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-5 w-5 text-foreground/80" />
            </div>

            <h2 className="text-lg font-semibold tracking-tight">
              Practice completed
            </h2>

            <p className="text-sm text-muted-foreground">
              Here’s a quick summary of how you did.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat
              icon={CheckCircle2}
              label="Correct"
              value={correct}
              variant="success"
            />
            <Stat
              icon={XCircle}
              label="Incorrect"
              value={wrong}
              variant="error"
            />
            <Stat icon={BarChart3} label="Total" value={total} />
          </div>

          {/* Actions */}
          <div className="mt-7 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onRetry}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>

            <Button className="flex-1 cursor-pointer" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  variant = "neutral",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  variant?: "success" | "error" | "neutral";
}) {
  const styles = {
    success: {
      bg: "bg-green-500/10",
      text: "text-green-600 dark:text-green-500",
      icon: "text-green-600/70 dark:text-green-500/70",
      border: "border-green-500/20",
    },
    error: {
      bg: "bg-red-500/10",
      text: "text-red-600 dark:text-red-500",
      icon: "text-red-600/70 dark:text-red-500/70",
      border: "border-red-500/20",
    },
    neutral: {
      bg: "bg-muted/40",
      text: "text-foreground",
      icon: "text-muted-foreground",
      border: "border-border",
    },
  }[variant];

  return (
    <div
      className={`flex flex-col items-center rounded-lg border px-3 py-3 ${styles.bg} ${styles.border}`}
    >
      <Icon className={`mb-1 h-4 w-4 ${styles.icon}`} />
      <div className={`text-lg font-semibold ${styles.text}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
