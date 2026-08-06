"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";
import { Lock, Unlock } from "lucide-react";

type Props = {
  attemptId: string;
  rankingAvailableAt: string | null;
};

export function DetailedAnalysisCTA({ attemptId, rankingAvailableAt }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [buttonWidth, setButtonWidth] = useState<string>("min-w-[230px]");

  useEffect(() => {
    if (!rankingAvailableAt) {
      const timer = setTimeout(() => setIsMounted(true), 0);
      return () => clearTimeout(timer);
    }

    const targetDate = new Date(rankingAvailableAt).getTime();

    // Group all initial state updates inside a single deferred timeout.
    // This perfectly bypasses the "cascading render" React warning!
    const mountTimer = setTimeout(() => {
      const now = Date.now();
      const initialDiff = targetDate - now;
      const initialSeconds = Math.floor(
        initialDiff > 0 ? initialDiff / 1000 : 0,
      );

      // 1. Set the fixed width based on the very first time calculation
      if (initialSeconds >= 86400) {
        setButtonWidth("min-w-[260px]");
      } else if (initialSeconds >= 3600) {
        setButtonWidth("min-w-[230px]");
      } else {
        setButtonWidth("min-w-[190px]");
      }

      // 2. Set initial time
      setTimeLeft(initialDiff > 0 ? initialDiff : 0);

      // 3. Mark as mounted
      setIsMounted(true);
    }, 0);

    // After the initial deferred setup, the interval takes over
    const interval = setInterval(() => {
      const diff = targetDate - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, [rankingAvailableAt]);

  // Prevent hydration mismatch on the server
  if (!isMounted) {
    return (
      <Button size="lg" className="min-w-58 rounded-sm opacity-0">
        Loading...
      </Button>
    );
  }

  // If no date is provided or timer reached 0, it's unlocked
  const isUnlocked = !rankingAvailableAt || timeLeft <= 0;

  if (isUnlocked) {
    return (
      <Link href={`/student/tests/results/${attemptId}/detailed`}>
        <Button
          size="lg"
          className="min-w-58 rounded-sm bg-primary hover:bg-primary/90"
        >
          <Unlock className="mr-2 h-4 w-4" />
          View Detailed Analysis
        </Button>
      </Link>
    );
  }

  // Calculate days, hours, minutes, seconds
  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400); // 24 * 60 * 60
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the time securely with zero-padding to prevent internal layout shifts
  let timeString = "";
  if (days > 0) {
    timeString = `${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  } else if (hours > 0) {
    timeString = `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  } else {
    timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col items-center text-center sm:items-end sm:text-right gap-1.5">
      <Button
        size="lg"
        disabled
        className={`${buttonWidth} rounded-sm disabled:opacity-100 bg-muted text-muted-foreground border-border border transition-all duration-300`}
      >
        <Lock className="mr-2 h-4 w-4 shrink-0" />
        <span>
          Unlocks in{" "}
          <span className="tabular-nums font-medium tracking-tight">
            {timeString}
          </span>
        </span>
      </Button>
      <span className="text-[11px] font-medium text-muted-foreground/80 animate-pulse">
        Available once the exam ends for everyone.
      </span>
    </div>
  );
}
