"use client";

import { forwardRef, type ElementType } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/src/components/ui/button";

// Extend native button props so it automatically accepts onClick, disabled, etc.
export interface EditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: ElementType;
  showIcon?: boolean;
}

export const EditButton = forwardRef<HTMLButtonElement, EditButtonProps>(
  (
    {
      text = "Edit",
      icon: Icon = Pencil,
      showIcon = true,
      children,
      className,
      ...props // This captures onClick, disabled, etc. injected by DialogTrigger
    },
    ref, // This captures the ref injected by DialogTrigger
  ) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={`h-8 rounded-lg border border-border/70 bg-muted/30 px-3 text-xs font-semibold text-foreground/80 shadow-none transition-all hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300 ${className || ""}`}
        {...props}
      >
        {showIcon && Icon && <Icon className="mr-1.5 size-3.5" />}
        {children || text}
      </Button>
    );
  },
);

EditButton.displayName = "EditButton";
