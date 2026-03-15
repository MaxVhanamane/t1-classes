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

interface OverflowBadgeGroupProps {
  items: string[];
  visibleCount?: number;
  badgeVariant?: "default" | "secondary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export function OverflowBadgeGroup({
  items,
  visibleCount = 2,
  badgeVariant = "secondary",
  size = "sm",
  className,
}: OverflowBadgeGroupProps) {
  const [open, setOpen] = useState(false);

  if (!items?.length) return null;

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  const sizeClasses =
    size === "md" ? "text-sm px-2.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <TooltipProvider delayDuration={120}>
      <div className={cn("flex flex-wrap items-center gap-1", className)}>
        {/* ---------------- Visible Badges ---------------- */}
        {visibleItems.map((item) => (
          <Badge key={item} variant={badgeVariant} className={sizeClasses}>
            {item}
          </Badge>
        ))}

        {/* ---------------- Overflow Badge ---------------- */}
        {hiddenItems.length > 0 && (
          <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                onClick={() => setOpen((p) => !p)}
                className={cn("cursor-pointer", sizeClasses)}
              >
                +{hiddenItems.length} more
              </Badge>
            </TooltipTrigger>

            <TooltipContent side="top" className="max-w-60">
              <div className="flex flex-wrap gap-1">
                {hiddenItems.map((item) => (
                  <span
                    key={item}
                    className="
                      rounded-md
                      bg-muted
                      px-2 py-0.5
                      text-xs
                    "
                  >
                    {item}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
