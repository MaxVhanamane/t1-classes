import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../popover"; // Adjust import path
import { cn } from "@/src/lib/utils";

// 1. Define the supported colors
export type PopoverColor =
  | "yellow"
  | "cyan"
  | "pink"
  | "purple"
  | "red"
  | "emerald";

// 2. Map colors to their specific Tailwind classes for borders, backgrounds, and text
const colorVariants: Record<
  PopoverColor,
  { border: string; badge: string; text: string }
> = {
  yellow: {
    border: "border-amber-500 dark:border-amber-400",
    badge: "bg-amber-500 dark:bg-amber-500 text-white",
    text: "text-amber-600 dark:text-amber-400",
  },
  cyan: {
    border: "border-cyan-500 dark:border-cyan-400",
    badge: "bg-cyan-500 dark:bg-cyan-500 text-white",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  pink: {
    border: "border-pink-500 dark:border-pink-400",
    badge: "bg-pink-500 dark:bg-pink-500 text-white",
    text: "text-pink-600 dark:text-pink-400",
  },
  purple: {
    border: "border-purple-500 dark:border-purple-400",
    badge: "bg-purple-500 dark:bg-purple-500 text-white",
    text: "text-purple-600 dark:text-purple-400",
  },
  red: {
    border: "border-red-500 dark:border-red-400",
    badge: "bg-red-500 dark:bg-red-500 text-white",
    text: "text-red-600 dark:text-red-400",
  },
  emerald: {
    border: "border-emerald-500 dark:border-emerald-400",
    badge: "bg-emerald-500 dark:bg-emerald-500 text-white",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

interface RichPopoverProps extends Omit<
  React.ComponentPropsWithoutRef<typeof PopoverContent>,
  "title"
> {
  trigger: React.ReactNode;
  color?: PopoverColor; // Added color prop
  badgeText?: string;
  metaText?: string;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
}

export const RichPopover = React.forwardRef<
  React.ComponentRef<typeof PopoverContent>,
  RichPopoverProps
>(
  (
    {
      trigger,
      color = "yellow", // Default color if none is provided
      className,
      badgeText,
      metaText,
      title,
      icon,
      description,
      children,
      ...props
    },
    ref,
  ) => {
    // Get the active color variant classes
    const activeColor = colorVariants[color];

    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>

        <PopoverContent
          ref={ref}
          className={cn(
            "w-72 p-5 rounded-2xl shadow-lg text-sm",
            "border-t-4 border-l-2 border-r-2 border-b-2",
            "bg-white dark:bg-[#24242d]",
            activeColor.border, // Apply dynamic border color
            className,
          )}
          {...props}
        >
          <div className="relative space-y-3.5">
            {(badgeText || metaText) && (
              <div className="flex items-center justify-between text-xs">
                {badgeText && (
                  <span
                    className={cn(
                      "font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                      activeColor.badge, // Apply dynamic badge background
                    )}
                  >
                    {badgeText}
                  </span>
                )}
                {metaText && (
                  <span className={cn("font-bold ml-auto", activeColor.text)}>
                    {metaText}
                  </span>
                )}
              </div>
            )}

            {(title || icon) && (
              <div className="flex items-center gap-2">
                {icon && (
                  <div className={cn("shrink-0", activeColor.text)}>{icon}</div>
                )}
                {title && (
                  <h4 className="font-bold text-foreground text-sm">{title}</h4>
                )}
              </div>
            )}

            {description && (
              <p className="text-muted-foreground leading-relaxed text-xs">
                {description}
              </p>
            )}

            {children}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

RichPopover.displayName = "RichPopover";
