"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";
import { Badge } from "../badge";

type ColorBadgeProps = {
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
};

type Variant = "green" | "yellow" | "blue" | "neutral" | "red" | "purple";

const variants: Record<Variant, string> = {
  green:
    "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400",

  yellow:
    "border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400",

  blue: "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400",

  neutral:
    "border-neutral-200 bg-neutral-50/60 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-300",

  red: "border-rose-200 bg-rose-50/50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400",

  purple:
    "border-violet-200 bg-violet-50/50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-900/20 dark:text-violet-400",
};

function ColorBadge({
  children,
  showDot = false,
  className,
  variant,
}: ColorBadgeProps & { variant: Variant }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium hover:bg-inherit",
        variants[variant],
        className,
      )}
    >
      {showDot && (
        <span className="size-1.5 shrink-0 rounded-full bg-current" />
      )}

      {children}
    </Badge>
  );
}

export function GreenBadge(props: ColorBadgeProps) {
  return <ColorBadge variant="green" {...props} />;
}

export function YellowBadge(props: ColorBadgeProps) {
  return <ColorBadge variant="yellow" {...props} />;
}

export function BlueBadge(props: ColorBadgeProps) {
  return <ColorBadge variant="blue" {...props} />;
}

export function NeutralBadge(props: ColorBadgeProps) {
  return <ColorBadge variant="neutral" {...props} />;
}

export function RedBadge(props: ColorBadgeProps) {
  return <ColorBadge variant="red" {...props} />;
}

export function PurpleBadge(props: ColorBadgeProps) {
  return <ColorBadge variant="purple" {...props} />;
}
