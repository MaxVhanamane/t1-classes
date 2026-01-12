import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  BatchMode,
  BatchStatus,
} from "@/src/app/admin/batches/_features/types/types";

interface BatchMetaBadgesProps {
  mode: BatchMode;
  status: BatchStatus;
  size?: "sm" | "md";
}

export function BatchMetaBadges({
  mode,
  status,
  size = "sm",
}: BatchMetaBadgesProps) {
  const sizeClasses =
    size === "md" ? "text-sm px-2.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5">
        {/* MODE */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn("cursor-help", sizeClasses)}>
              {BATCH_MODE_UI_LABELS[mode]}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{BATCH_MODE_EXPLANATION[mode]}</p>
          </TooltipContent>
        </Tooltip>

        {/* STATUS */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "cursor-help",
                sizeClasses,
                getStatusStyles(status)
              )}
            >
              {BATCH_STATUS_UI_LABELS[status]}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{BATCH_STATUS_EXPLANATION[status]}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/* ---------- styles ---------- */

function getStatusStyles(status: BatchStatus) {
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

    case "cancelled":
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

/* ---------- labels (shown on badge) ---------- */

export const BATCH_MODE_UI_LABELS: Record<BatchMode, string> = {
  online: "Live Online",
  offline: "Classroom",
  hybrid: "Hybrid",
};

export const BATCH_STATUS_UI_LABELS: Record<BatchStatus, string> = {
  upcoming: "Starting Soon",
  ongoing: "Classes Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

/* ---------- explanations (shown in tooltip) ---------- */

export const BATCH_MODE_EXPLANATION: Record<BatchMode, string> = {
  online: "Live classes conducted online",
  offline: "In-person classroom teaching",
  hybrid: "Combination of online and classroom sessions",
};

export const BATCH_STATUS_EXPLANATION: Record<BatchStatus, string> = {
  upcoming: "Classes for this batch will begin soon",
  ongoing: "Classes for this batch are currently running",
  completed: "Classes for this batch have been completed",
  cancelled: "This batch has been cancelled",
};
