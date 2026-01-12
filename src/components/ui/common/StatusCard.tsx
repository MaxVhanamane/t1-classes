"use client";

import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

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
          "flex min-h-screen items-center justify-center bg-background px-4"
      )}
    >
      <div
        className={cn(
          "w-full max-w-sm rounded-2xl border bg-card p-10 text-center space-y-6 shadow-sm",
          className
        )}
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">{title}</h2>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-center text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
