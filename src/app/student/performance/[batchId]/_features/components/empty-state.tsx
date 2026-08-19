import { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  showBorder?: boolean;
  className?: string;
}

export function EmptyState({
  title = "No data available",
  description,
  icon,
  showBorder = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 min-h-[250px] mb-4 sm:mb-6 flex-col items-center justify-center rounded-xl p-6 text-center animate-in fade-in zoom-in-95 duration-500",
        showBorder && "border border-dashed border-border/50",
        className,
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 dark:bg-muted/20 ring-1 ring-border/50 shadow-sm">
        {/* Universal generic empty state icon */}
        {icon || (
          <FolderOpen
            className="h-6 w-6 text-muted-foreground/70"
            strokeWidth={1.5}
          />
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-[260px] text-[11px] text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
