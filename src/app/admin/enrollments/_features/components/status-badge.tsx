import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { CircleCheck, CircleOff } from "lucide-react";

type StatusBadgeProps = {
  isActive: boolean;
};

function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-colors",
        isActive
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
          : "border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/10 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300",
      )}
    >
      {isActive ? (
        <CircleCheck className="size-3.5 shrink-0" />
      ) : (
        <CircleOff className="size-3.5 shrink-0" />
      )}

      <span>{isActive ? "Active" : "Inactive"}</span>
    </Badge>
  );
}

export default StatusBadge;
