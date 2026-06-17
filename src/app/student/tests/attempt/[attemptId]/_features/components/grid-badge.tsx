"use client";

import { Badge } from "@/src/components/ui/badge";

import { GridState } from "../types/grid.types";
import { getGridClasses } from "../helpers/grid-colors";
import { cn } from "@/src/lib/utils";

export default function GridBadge({
  state,
  count = 0,
}: {
  state: GridState;
  count?: number;
}) {
  const className = getGridClasses(state);

  const badgeClass = cn(
    className,
    "inline-flex w-[calc(50%-4px)] relative min-w-0 flex-col items-center justify-center gap-1 rounded-sm px-2 py-2 text-[11px] font-semibold",
  );

  const labelClass =
    "w-full text-center text-[10px] leading-tight whitespace-normal break-words";

  const countClass = cn(
    "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums text-white",
    state === "answered" && "bg-green-500 dark:bg-green-700",
    state === "review" && "bg-purple-500 dark:bg-purple-700",
    state === "answered_review" && "bg-blue-500 dark:bg-blue-700",
    state === "not_answered" && "bg-yellow-500 dark:bg-yellow-700",
    state === "not_visited" && "bg-slate-500 dark:bg-slate-700",
  );

  switch (state) {
    case "answered":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>Answered</span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    case "review":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>Marked for Review</span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    case "answered_review":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>Answered & Review</span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    case "not_answered":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>Seen (Not Answered)</span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    default:
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>Not Visited</span>
          <span className={countClass}>{count}</span>
        </Badge>
      );
  }
}
