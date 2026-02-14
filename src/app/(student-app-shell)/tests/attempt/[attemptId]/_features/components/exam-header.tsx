"use client";

import { Clock } from "lucide-react";
import { useServerTimer } from "../hooks/use-server-timer";

type Props = {
  studentName: string;
  testTitle: string;
  expiresAt: string;
};

export default function ExamHeader({
  studentName,
  testTitle,
  expiresAt,
}: Props) {
  const seconds = useServerTimer(expiresAt, () => {
    window.dispatchEvent(new Event("exam-autosubmit"));
  });

  return (
    <header className="flex items-center justify-between border-b px-6 py-2">
      {/* Left */}
      <div>
        <p className="text-xs text-muted-foreground">{studentName}</p>
        <h1 className="text-sm font-semibold truncate max-w-50">{testTitle}</h1>
      </div>

      {/* Center — Timer */}
      <div
        className={`flex items-center gap-2 font-mono text-lg ${
          seconds < 60 ? "text-red-600" : ""
        }`}
      >
        <Clock className={seconds < 60 ? "text-red-600" : ""} />

        {/* Prevent hydration mismatch */}
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
