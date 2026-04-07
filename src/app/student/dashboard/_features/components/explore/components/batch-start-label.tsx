"use client";
import { useState } from "react";
import { formatDateShort } from "@/src/lib/date";

export function BatchStartLabel({ startDate }: { startDate: string }) {
  const [hasStarted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new Date(startDate) <= new Date();
  });

  return (
    <span className="text-xs text-muted-foreground">
      {hasStarted ? "Started" : "Starts"} {formatDateShort(startDate)}
    </span>
  );
}
