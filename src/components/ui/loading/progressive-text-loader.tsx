"use client";

import { useEffect, useState } from "react";
import { Loader, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

type LoaderSize = "sm" | "md" | "lg";

type Props = {
  messages: string[];
  intervalMs?: number;
  className?: string;
  showGlow?: boolean;
  spinnerVariant?: "spiky" | "rounded";
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

export function ProgressiveTextLoader({
  messages,
  intervalMs = 1500,
  className,
  showGlow = true,
  spinnerVariant = "spiky",
  size = "sm",
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [messages, intervalMs]);

  const SelectedLoader = spinnerVariant === "rounded" ? Loader2 : Loader;
  const currentSize = sizeStyles[size];

  // If no messages are passed, fallback to just a spinner
  if (!messages || messages.length === 0) {
    return (
      <SelectedLoader
        className={cn(
          "animate-spin text-primary animation-duration-[1.5s]",
          currentSize.icon,
          className,
        )}
      />
    );
  }

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
        <SelectedLoader
          className={cn(
            "relative z-10 animate-spin text-primary",
            currentSize.icon,
          )}
        />

        {/* Soft glow ring */}
        {showGlow && (
          <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-xl" />
        )}
      </div>

      {/* Changing text */}
      <div className="h-5">
        <p
          key={index}
          className={cn(
            "animate-in fade-in zoom-in-95 duration-300 font-medium text-muted-foreground",
            currentSize.text,
          )}
        >
          {messages[index]}
        </p>
      </div>
    </div>
  );
}
