"use client";
import { useEffect, useState } from "react";
import { formatDateShort } from "@/src/lib/date";
import { Skeleton } from "@/src/components/ui/skeleton";

export function BatchStartLabel({ startDate }: { startDate: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Skeleton className="text-xs text-muted-foreground h-5 w-28 rounded-md" />
    );
  }

  const hasStarted = new Date(startDate) <= new Date();

  return (
    <span className="text-xs text-muted-foreground">
      {hasStarted ? "Started" : "Starts"} {formatDateShort(startDate)}
    </span>
  );
}
