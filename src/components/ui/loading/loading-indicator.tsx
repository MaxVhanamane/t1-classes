import { cn } from "@/src/lib/utils";
import { Loader, Loader2 } from "lucide-react";

type LoadingIndicatorProps = {
  message?: string;
  className?: string;
  type?: "spiked" | "normal";
};

export function LoadingIndicator({
  message,
  className,
  type = "spiked",
}: LoadingIndicatorProps) {
  const Icon = type === "normal" ? Loader2 : Loader;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Icon className="size-6 animate-spin text-muted-foreground" />

      {message && (
        <p className="text-center text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
