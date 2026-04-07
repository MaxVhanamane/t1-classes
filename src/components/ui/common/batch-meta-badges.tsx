"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { BatchMode } from "@/src/app/admin/batches/_features/types/types";
import {
  BatchLifecycle,
  getBatchLifecycle,
} from "@/src/lib/helper-functions/get-batch-lifecycle";

/* ------------------------------------------------ */
/* Types */
/* ------------------------------------------------ */

interface BatchMetaBadgesProps {
  batch: {
    mode: BatchMode;
    start_date: string;
    end_date: string;
    is_active: boolean;
  };
  size?: "sm" | "md";
}

/* ------------------------------------------------ */
/* Component */
/* ------------------------------------------------ */

export function BatchMetaBadges({ batch, size = "sm" }: BatchMetaBadgesProps) {
  const [lifecycle, setLifecycle] = useState<BatchLifecycle>("upcoming");

  useEffect(() => {
    setLifecycle(getBatchLifecycle(batch));
  }, [batch]);

  const sizeClasses =
    size === "md" ? "text-sm px-2.5 py-0.5" : "text-xs px-2 py-0.5";

  const badges = [
    {
      key: "mode",
      label: BATCH_MODE_UI_LABELS[batch.mode],
      description: BATCH_MODE_EXPLANATION[batch.mode],
      className: "text-color-foreground",
    },
    {
      key: "status",
      label: BATCH_STATUS_UI_LABELS[lifecycle],
      description: BATCH_STATUS_EXPLANATION[lifecycle],
      className: getStatusStyles(lifecycle),
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-wrap gap-1.5 z-10">
        {badges.map((badge) => (
          <BadgeWithTooltip
            key={badge.key}
            label={badge.label}
            description={badge.description}
            className={cn(sizeClasses, badge.className)}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------ */
/* Reusable Badge With Tooltip */
/* ------------------------------------------------ */

function BadgeWithTooltip({
  label,
  description,
  className,
}: {
  label: string;
  description: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn("cursor-pointer select-none", className)}
          onClick={() => setOpen((prev) => !prev)}
        >
          {label}
        </Badge>
      </TooltipTrigger>

      <TooltipContent side="top">
        <p className="text-xs">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------ */
/* Styles */
/* ------------------------------------------------ */

function getStatusStyles(status: BatchLifecycle) {
  switch (status) {
    case "upcoming":
      return `
        bg-yellow-100 text-yellow-800 border-yellow-200
        dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50
      `;

    case "ongoing":
      return `
        bg-green-100 text-green-800 border-green-200
        dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50
      `;

    case "completed":
      return `
        bg-gray-100 text-gray-700 border-gray-200
        dark:bg-muted dark:text-muted-foreground dark:border-border
      `;

    case "inactive":
      return `
        bg-red-100 text-red-800 border-red-200
        dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50
      `;

    default:
      return `
        bg-gray-100 text-gray-700 border-gray-200
        dark:bg-muted dark:text-muted-foreground dark:border-border
      `;
  }
}

/* ------------------------------------------------ */
/* Labels */
/* ------------------------------------------------ */

export const BATCH_MODE_UI_LABELS: Record<BatchMode, string> = {
  online: "Live Online",
  offline: "Classroom",
  hybrid: "Hybrid",
};

export const BATCH_STATUS_UI_LABELS: Record<BatchLifecycle, string> = {
  upcoming: "Starting Soon",
  ongoing: "Classes Ongoing",
  completed: "Completed",
  inactive: "Inactive",
};

/* ------------------------------------------------ */
/* Explanations */
/* ------------------------------------------------ */

export const BATCH_MODE_EXPLANATION: Record<BatchMode, string> = {
  online: "Live classes conducted online",
  offline: "In-person classroom teaching",
  hybrid: "Combination of online and classroom sessions",
};

export const BATCH_STATUS_EXPLANATION: Record<BatchLifecycle, string> = {
  upcoming: "Classes for this batch will begin soon",
  ongoing: "Classes for this batch are currently running",
  completed: "Classes for this batch have been completed",
  inactive: "This batch is currently inactive and not open for enrollment",
};
