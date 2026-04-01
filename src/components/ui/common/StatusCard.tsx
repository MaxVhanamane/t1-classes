"use client";

import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { GridBackground } from "../../grid-background";

type StatusCardProps = {
  /** Main title */
  title: string;

  /** Supporting description */
  description?: string;

  /** Icon shown in the circle (Loader, Check, etc.) */
  icon: ReactNode;

  /** Optional footer content (status text, steps, etc.) */
  footer?: ReactNode;

  /** Full screen centered layout */
  fullscreen?: boolean;

  /** Optional container class override */
  className?: string;
};

export function StatusCard({
  title,
  description,
  icon,
  footer,
  fullscreen = true,
  className,
}: StatusCardProps) {
  const Wrapper = fullscreen ? "div" : "section";

  return (
    <Wrapper
      className={cn(
        fullscreen &&
          "flex min-h-screen items-center justify-center bg-background px-4   ",
      )}
    >
      <div
        className={cn(
          "w-full max-w-sm rounded-2xl border bg-background p-10 text-center shadow-sm relative z-10 overflow-hidden",
          className,
        )}
      >
        {/* Top glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 
      bg-linear-to-b from-green-400/15 via-green-400/5 to-transparent 
      dark:from-green-500/50 dark:via-green-500/5 blur-2xl rounded-2xl"
        />

        {/* Border glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset 
      ring-green-500/10 dark:ring-green-500/15"
        />

        <GridBackground className="rounded-xl opacity-30" />
        {/* Icon */}
        <div className="space-y-4">
          <div className="flex justify-center relative z-10 ">
            <div className="relative h-16 w-16 flex items-center justify-center">
              {/*  outer soft glow */}
              <div className="absolute inset-0 rounded-full bg-green-400/10 blur-xl" />

              {/*  outer ripple */}
              <div className="absolute inset-0 rounded-full border border-green-400/30 animate-ping" />

              {/*  inner ripple (delayed + tighter) */}
              <div className="absolute h-10 w-10 rounded-full border border-green-400/25 animate-ping [animation-delay:0.4s]" />

              {/*  core container */}
              <div
                className="relative h-10 w-10 rounded-full bg-linear-to-br from-green-300 via-green-600 to-emerald-700 
      flex items-center justify-center text-white shadow-lg shadow-green-500/30"
              >
                {/* ✨ subtle inner shine */}
                <div className="absolute inset-0 rounded-full bg-white/10" />

                {/* icon */}
                <div className="relative">{icon}</div>
              </div>
            </div>
          </div>
          {/* Text */}
          <div className="space-y-2 z-10 relative">
            <h2 className="text-lg font-medium text-foreground">{title}</h2>

            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex justify-center text-muted-foreground z-10 relative">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
