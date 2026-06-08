import { cn } from "@/src/lib/utils";
import { Loader } from "lucide-react";

type LoadingIndicatorProps = {
  message?: string;
  className?: string;
};

export function LoadingIndicator({
  message,
  className,
}: LoadingIndicatorProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Loader className="size-6 animate-spin text-muted-foreground" />

      {message && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
    </div>
  );
}
