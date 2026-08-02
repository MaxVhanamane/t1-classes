import { forwardRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../popover"; // Adjust import path
import { cn } from "@/src/lib/utils";

// 1. Define the supported colors
export type PopoverColor =
  | "cyan"
  | "emerald"
  | "yellow"
  | "pink"
  | "purple"
  | "indigo"
  | "teal"
  | "gray"
  | "blue"
  | "red"
  | "orange"
  | "amber"
  | "lime"
  | "green"
  | "sky"
  | "violet"
  | "fuchsia"
  | "rose";

// 2. Map colors to their specific Tailwind classes for borders, backgrounds, and text
const colorVariants: Record<
  PopoverColor,
  { border: string; badge: string; text: string }
> = {
  cyan: {
    border: "border-cyan-500 dark:border-cyan-400",
    badge: "bg-cyan-500 dark:bg-cyan-500 text-white",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  emerald: {
    border: "border-emerald-500 dark:border-emerald-400",
    badge: "bg-emerald-500 dark:bg-emerald-500 text-white",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  yellow: {
    border: "border-yellow-500 dark:border-yellow-400",
    badge: "bg-yellow-500 dark:bg-yellow-500 text-white",
    text: "text-yellow-600 dark:text-yellow-400",
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
  indigo: {
    border: "border-indigo-500 dark:border-indigo-400",
    badge: "bg-indigo-500 dark:bg-indigo-500 text-white",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  teal: {
    border: "border-teal-500 dark:border-teal-400",
    badge: "bg-teal-500 dark:bg-teal-500 text-white",
    text: "text-teal-600 dark:text-teal-400",
  },
  gray: {
    border: "border-gray-500 dark:border-gray-400",
    badge: "bg-gray-500 dark:bg-gray-500 text-white",
    text: "text-gray-600 dark:text-gray-400",
  },
  blue: {
    border: "border-blue-500 dark:border-blue-400",
    badge: "bg-blue-500 dark:bg-blue-500 text-white",
    text: "text-blue-600 dark:text-blue-400",
  },
  red: {
    border: "border-red-500 dark:border-red-400",
    badge: "bg-red-500 dark:bg-red-500 text-white",
    text: "text-red-600 dark:text-red-400",
  },
  orange: {
    border: "border-orange-500 dark:border-orange-400",
    badge: "bg-orange-500 dark:bg-orange-500 text-white",
    text: "text-orange-600 dark:text-orange-400",
  },
  amber: {
    border: "border-amber-500 dark:border-amber-400",
    badge: "bg-amber-500 dark:bg-amber-500 text-white",
    text: "text-amber-600 dark:text-amber-400",
  },
  lime: {
    border: "border-lime-500 dark:border-lime-400",
    badge: "bg-lime-500 dark:bg-lime-500 text-white",
    text: "text-lime-600 dark:text-lime-400",
  },
  green: {
    border: "border-green-500 dark:border-green-400",
    badge: "bg-green-500 dark:bg-green-500 text-white",
    text: "text-green-600 dark:text-green-400",
  },
  sky: {
    border: "border-sky-500 dark:border-sky-400",
    badge: "bg-sky-500 dark:bg-sky-500 text-white",
    text: "text-sky-600 dark:text-sky-400",
  },
  violet: {
    border: "border-violet-500 dark:border-violet-400",
    badge: "bg-violet-500 dark:bg-violet-500 text-white",
    text: "text-violet-600 dark:text-violet-400",
  },
  fuchsia: {
    border: "border-fuchsia-500 dark:border-fuchsia-400",
    badge: "bg-fuchsia-500 dark:bg-fuchsia-500 text-white",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  rose: {
    border: "border-rose-500 dark:border-rose-400",
    badge: "bg-rose-500 dark:bg-rose-500 text-white",
    text: "text-rose-600 dark:text-rose-400",
  },
};

interface RichPopoverProps extends Omit<
  React.ComponentPropsWithoutRef<typeof PopoverContent>,
  "title"
> {
  trigger: React.ReactNode;
  color?: PopoverColor;
  badgeText?: string;
  metaText?: string;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
}

export const RichPopover = forwardRef<
  React.ComponentRef<typeof PopoverContent>,
  RichPopoverProps
>(
  (
    {
      trigger,
      color = "yellow",
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
            activeColor.border,
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
                      activeColor.badge,
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
