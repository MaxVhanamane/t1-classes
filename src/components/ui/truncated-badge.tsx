"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { cn } from "@/src/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface TruncatedBadgeProps {
  text: string;
  maxChars?: number;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md";
  overlay?: boolean;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export function TruncatedBadge({
  text,
  maxChars = 18,
  variant = "secondary",
  size = "sm",
  overlay = false,
  className,
}: TruncatedBadgeProps) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  const isTruncated = text.length > maxChars;

  const displayText = isTruncated ? text.slice(0, maxChars) + "..." : text;

  const sizeClasses =
    size === "md" ? "text-sm px-2.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Badge
            variant={variant}
            onClick={() => setOpen((p) => !p)}
            className={cn(
              "cursor-pointer select-none whitespace-nowrap",
              sizeClasses,

              /* Overlay safety */
              overlay &&
                "text-white bg-white/10 border-white/30 hover:bg-white/20",

              className,
            )}
          >
            {displayText}
          </Badge>
        </TooltipTrigger>

        {isTruncated && (
          <TooltipContent side="top" className="max-w-65">
            <p className="text-xs leading-relaxed">{text}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
