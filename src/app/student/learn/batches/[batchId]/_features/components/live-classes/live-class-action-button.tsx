"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Radio, PlaySquare, Calendar } from "lucide-react";

type Props = {
  status: "upcoming" | "live" | "completed";
  startsAt: string;
  onClick: () => void;
};

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function LiveClassActionButton({ status, startsAt, onClick }: Props) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (status !== "upcoming") return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const startTime = new Date(startsAt).getTime();
  const diff = startTime - now;

  //  auto-switch to live when timer hits zero
  const isNowLive = status === "upcoming" && diff <= 0;

  /* ---------------- UI ---------------- */

  //  LIVE
  if (status === "live" || isNowLive) {
    return (
      <div className="flex justify-end">
        <Button size="sm" onClick={onClick} className="relative">
          {/* pulsing dot */}
          {/* <span className="mr-2 flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span> */}
          <Radio className="mr-2 h-4 w-4" />
          Join Live
        </Button>
      </div>
    );
  }

  //  COMPLETED
  if (status === "completed") {
    return (
      <div className="flex justify-end">
        <Button size="sm" onClick={onClick}>
          <PlaySquare className="mr-2 h-4 w-4" />
          Watch Class
        </Button>
      </div>
    );
  }

  //  UPCOMING (elegant, NOT a button)
  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />

        <span>Starts in</span>

        <span className="tabular-nums w-13.5 text-right">
          {formatTime(diff)}
        </span>
      </div>
    </div>
  );
}
