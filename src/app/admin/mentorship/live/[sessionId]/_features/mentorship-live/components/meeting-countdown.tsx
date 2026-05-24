"use client";

import { cn } from "@/src/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

interface MeetingCountdownProps {
  endsAt: string;
  onExpire?: () => void; // optional
}

export function MeetingCountdown({ endsAt, onExpire }: MeetingCountdownProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const hasExpiredRef = useRef(false);

  useEffect(() => {
    const endTime = new Date(endsAt).getTime();

    if (Number.isNaN(endTime)) {
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();

      const diff = Math.max(0, Math.floor((endTime - now) / 1000));

      setRemainingSeconds(diff);
      if (diff === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.(); // only calls if provided
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [endsAt, onExpire]);

  const formattedTime = useMemo(() => {
    if (remainingSeconds === null) {
      return "--:--";
    }

    const hours = Math.floor(remainingSeconds / 3600);

    const minutes = Math.floor((remainingSeconds % 3600) / 60);

    const seconds = remainingSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [remainingSeconds]);

  const isCritical = remainingSeconds !== null && remainingSeconds <= 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm ring-1 backdrop-blur-md transition-all duration-300",
        isCritical
          ? "border-red-500/20 bg-red-500/10 ring-red-500/10"
          : "border-white/10 bg-zinc-900/50 ring-white/5",
      )}
    >
      <div
        className={cn(
          "size-2 rounded-full",
          isCritical
            ? "animate-pulse bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]"
            : "bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]",
        )}
      />

      <span
        className={cn(
          "min-w-24 text-center text-xs font-medium tabular-nums tracking-[0.08em]",
          isCritical ? "text-red-200" : "text-zinc-200",
        )}
      >
        Ends in {formattedTime}
      </span>
    </div>
  );
}
