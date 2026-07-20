"use client";

import { forwardRef, type ElementType } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";

// Extend native button props
export interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: ElementType;
  showIcon?: boolean;
}

export const DeleteButton = forwardRef<HTMLButtonElement, DeleteButtonProps>(
  (
    {
      text = "Delete",
      icon: Icon = Trash2,
      showIcon = true,
      children,
      className,
      ...props // Captures onClick, disabled, and DialogTrigger injected props
    },
    ref, // Captures the ref for Radix UI
  ) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={`h-8 rounded-lg border border-rose-200/60 bg-rose-50/40 px-3 text-xs font-semibold text-rose-700 shadow-none transition-all hover:border-rose-300 hover:bg-rose-100/70 hover:text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:border-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-200 ${className || ""}`}
        {...props}
      >
        {showIcon && Icon && <Icon className="mr-1.5 size-3.5" />}
        {children || text}
      </Button>
    );
  },
);

DeleteButton.displayName = "DeleteButton";
