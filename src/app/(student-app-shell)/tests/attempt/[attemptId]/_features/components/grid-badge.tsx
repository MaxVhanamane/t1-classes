"use client";

import { Badge } from "@/src/components/ui/badge";
import { Circle, CheckCircle2, Flag } from "lucide-react";

import { GridState } from "../types/grid.types";
import { getGridClasses } from "../helpers/grid-colors";

export default function GridBadge({ state }: { state: GridState }) {
  const className = getGridClasses(state);

  switch (state) {
    case "answered":
      return (
        <Badge className={className}>
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Answered
        </Badge>
      );

    case "review":
      return (
        <Badge className={className}>
          <Flag className="mr-1 h-3 w-3" />
          Marked for Review
        </Badge>
      );

    case "answered_review":
      return (
        <Badge className={className}>
          <Flag className="mr-1 h-3 w-3" />
          Answered & Review
        </Badge>
      );

    case "not_answered":
      return (
        <Badge className={className}>
          <Circle className="mr-1 h-3 w-3" />
          Seen (Not Answered)
        </Badge>
      );

    default:
      return (
        <Badge className={className}>
          <Circle className="mr-1 h-3 w-3" />
          Not Visited
        </Badge>
      );
  }
}
