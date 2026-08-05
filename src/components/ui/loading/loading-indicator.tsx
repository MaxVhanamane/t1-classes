import { cn } from "@/src/lib/utils";
import { Loader, Loader2 } from "lucide-react";

type LoaderSize = "sm" | "md" | "lg";

type LoadingIndicatorProps = {
  message?: string;
  className?: string;
  type?: "spiked" | "normal";
  showGlow?: boolean;
  size?: LoaderSize;
};

const sizeStyles: Record<
  LoaderSize,
  { icon: string; text: string; gap: string }
> = {
  sm: {
    icon: "h-6 w-6",
    text: "text-xs",
    gap: "gap-4",
  },
  md: {
    icon: "h-10 w-10",
    text: "text-sm",
    gap: "gap-6",
  },
  lg: {
    icon: "h-14 w-14",
    text: "text-base",
    gap: "gap-8",
  },
};

export function LoadingIndicator({
  message,
  className,
  type = "spiked",
  showGlow = false,
  size = "sm",
}: LoadingIndicatorProps) {
  const Icon = type === "normal" ? Loader2 : Loader;
  const currentSize = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        currentSize.gap,
        className,
      )}
    >
      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        <Icon
          className={cn(
            "relative z-10 animate-spin animation-duration-[1.5s] text-primary",
            currentSize.icon,
          )}
        />

        {/* Soft glow ring */}
        {showGlow && (
          <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-xl" />
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="h-5">
          <p
            className={cn(
              "font-medium text-muted-foreground",
              currentSize.text,
            )}
          >
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
