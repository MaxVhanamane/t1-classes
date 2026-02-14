"use client";

import { cn } from "@/src/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type SectionErrorProps = {
  /** Main title */
  title?: string;

  /** Supporting message */
  message?: string;

  /** Retry handler */
  onRetry?: () => void;

  /** Retry button label */
  retryLabel?: string;

  /** Visual style variant */
  variant?: "card" | "alert" | "inline" | "minimal";

  /** Optional icon override */
  icon?: React.ReactNode;

  /** Additional classNames */
  className?: string;
};

export function SectionError({
  title = "Something went wrong",
  message = "We couldn’t load this section. Please try again.",
  onRetry,
  retryLabel = "Try again",
  variant = "card",
  icon,
  className,
}: SectionErrorProps) {
  const Icon = icon ?? <AlertTriangle className="h-5 w-5 text-destructive" />;

  // ─────────────────────────────────────────────
  // Minimal (tiny widgets / sidebars)
  // ─────────────────────────────────────────────
  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          className,
        )}
      >
        {Icon}
        <span>{message}</span>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Inline (tables / lists / compact sections)
  // ─────────────────────────────────────────────
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border bg-muted/40 p-3",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          {Icon}
          <p className="text-sm">{message}</p>
        </div>

        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Alert (info surfaces)
  // ─────────────────────────────────────────────
  if (variant === "alert") {
    return (
      <Alert
        variant="destructive"
        className={cn("flex items-start gap-2", className)}
      >
        {Icon}

        <div className="flex-1">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-1">{message}</AlertDescription>

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {retryLabel}
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  // ─────────────────────────────────────────────
  // Default → Card (dashboard sections)
  // ─────────────────────────────────────────────
  return (
    <Card className={cn("border-destructive/40 bg-destructive/5", className)}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="rounded-lg bg-destructive/10 p-2">{Icon}</div>

        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{message}</p>

        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="mt-4 gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
