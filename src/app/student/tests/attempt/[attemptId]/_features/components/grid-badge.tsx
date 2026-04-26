"use client";

import { Badge } from "@/src/components/ui/badge";
import { Circle, CheckCircle2, Flag } from "lucide-react";

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
    "inline-flex w-[190px] items-center justify-between gap-2 rounded-sm px-3 py-1.5 text-[11px] font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02]",
  );

  const labelClass = "flex min-w-0 items-center truncate";

  const countClass = cn(
    "ml-1 shrink-0 inline-flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white ",
    state === "answered" && "bg-green-500 dark:bg-green-700",
    state === "review" && "bg-purple-500 dark:bg-purple-700",
    state === "answered_review" && "bg-teal-500 dark:bg-teal-700",
    state === "not_answered" && "bg-yellow-500 dark:bg-yellow-700",
    state === "not_visited" && "bg-slate-500 dark:bg-slate-700",
  );

  switch (state) {
    case "answered":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>
            <CheckCircle2 className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">Answered</span>
          </span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    case "review":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>
            <Flag className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">Marked for Review</span>
          </span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    case "answered_review":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>
            <Flag className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">Answered & Review</span>
          </span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    case "not_answered":
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>
            <Circle className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">Seen (Not Answered)</span>
          </span>
          <span className={countClass}>{count}</span>
        </Badge>
      );

    default:
      return (
        <Badge className={badgeClass}>
          <span className={labelClass}>
            <Circle className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">Not Visited</span>
          </span>
          <span className={countClass}>{count}</span>
        </Badge>
      );
  }
}
