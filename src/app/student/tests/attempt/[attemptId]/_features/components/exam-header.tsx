"use client";

import { Clock } from "lucide-react";
import { useServerTimer } from "../hooks/use-server-timer";
import { cn } from "@/src/lib/utils";

type Props = {
  testTitle: string;
  expiresAt: string;
};

export default function ExamHeader({ testTitle, expiresAt }: Props) {
  const seconds = useServerTimer(expiresAt, () => {
    window.dispatchEvent(new Event("exam-autosubmit"));
  });

  const isCritical = seconds < 60;

  return (
    <header className="flex items-center justify-between min-[820px]:border-b bg-background px-3 py-2 md:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold tracking-tight md:text-base">
          {testTitle}
        </h1>
      </div>

      {/* Right */}
      <div
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5  py-1 font-mono text-sm font-semibold tabular-nums transition-colors ",

          isCritical ? " text-red-600 dark:text-red-400" : " text-foreground",
        )}
      >
        <Clock className="h-3.5 w-3.5" />

        <span suppressHydrationWarning>{formatTime(seconds)}</span>
      </div>
    </header>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
