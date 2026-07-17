"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface MeetingCountdownProps {
  endsAt: string;
  onExpire?: () => void;
}

export function MeetingCountdown({ endsAt, onExpire }: MeetingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        onExpire?.();
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
      setIsUrgent(distance < 60000); // Turn red if less than 1 minute remains
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onExpire]);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums shadow-sm transition-colors",
        isUrgent
          ? "bg-red-500/10 text-red-500 border border-red-500/20"
          : "bg-muted text-muted-foreground border border-transparent",
      )}
    >
      <Clock className="size-3" />
      {timeLeft}
    </div>
  );
}
