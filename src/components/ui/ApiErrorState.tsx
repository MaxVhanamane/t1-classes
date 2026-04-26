"use client";

import { cn } from "@/src/lib/utils";
import {
  AlertTriangle,
  ShieldX,
  RefreshCcw,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";

import { motion } from "motion/react";
import { ApiError } from "@/src/lib/helper-functions/api-error-class";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */

type ApiErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "card" | "alert" | "inline" | "minimal";
  className?: string;
  icon?: React.ReactNode;
};

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export function ApiErrorState({
  error,
  onRetry,
  retryLabel = "Retry",
  variant = "card",
  className,
  icon,
}: ApiErrorStateProps) {
  /* ------------------------------------------------------------ */
  /* Denied detection */
  /* ------------------------------------------------------------ */

  const isDenied =
    error instanceof ApiError &&
    error.info &&
    typeof error.info === "object" &&
    "kind" in error.info &&
    (error.info as { kind?: string }).kind === "denied";

  /* ------------------------------------------------------------ */
  /* Defaults */
  /* ------------------------------------------------------------ */

  let title = "Something went wrong";
  let message =
    "An unexpected server error occurred while loading this data. Please try again.";

  if (error instanceof ApiError) {
    message = error.message;
  }

  let resolvedIcon: React.ReactNode = (
    <AlertTriangle className="h-5 w-5 text-destructive" />
  );

  let iconTone = "bg-destructive/10";

  /* ------------------------------------------------------------ */
  /* Denied reason mapping */
  /* ------------------------------------------------------------ */

  if (isDenied) {
    const reason = (error.info as { reason?: string }).reason ?? "";

    if (reason === "not_owner") {
      title = "Access Restricted";
      message = "This result does not belong to your account.";
      resolvedIcon = <ShieldX className="h-5 w-5 text-amber-600" />;
      iconTone = "bg-amber-500/10";
    } else if (reason === "not_enrolled") {
      title = "Enrollment Required";
      message = "You need to be enrolled to view this result.";
      resolvedIcon = <ShieldX className="h-5 w-5 text-amber-600" />;
      iconTone = "bg-amber-500/10";
    } else if (reason === "not_found") {
      title = "Result not found";
      message = "We couldn’t find the requested result.";
      resolvedIcon = <AlertTriangle className="h-5 w-5 text-amber-600" />;
      iconTone = "bg-amber-500/10";
    } else if (reason === "attempt_not_found") {
      title = "You didn’t attempt this test";
      message = "No attempt was recorded for this test.";
      resolvedIcon = <ClipboardList className="h-5 w-5 text-primary" />;
      iconTone = "bg-primary/10";
    }
  }

  /* Icon override */
  if (icon) {
    resolvedIcon = icon;
  }

  /* ------------------------------------------------------------ */
  /* Variant → Minimal */
  /* ------------------------------------------------------------ */

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          className,
        )}
      >
        {resolvedIcon}
        <span>{message}</span>
      </div>
    );
  }

  /* ------------------------------------------------------------ */
  /* Variant → Inline */
  /* ------------------------------------------------------------ */

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border bg-muted/40 p-3",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          {resolvedIcon}
          <p className="text-sm">{message}</p>
        </div>

        {!isDenied && onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1">
            <RefreshCcw className="h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------ */
  /* Variant → Alert */
  /* ------------------------------------------------------------ */

  if (variant === "alert") {
    return (
      <Alert
        variant="destructive"
        className={cn("flex items-start gap-2", className)}
      >
        {resolvedIcon}

        <div className="flex-1">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-1">{message}</AlertDescription>

          {!isDenied && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 gap-1"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {retryLabel}
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  /* ------------------------------------------------------------ */
  /* Default → Card (animated) */
  /* ------------------------------------------------------------ */

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-6 sm:p-10",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center text-center gap-6 p-10">
            <div className={cn("p-5 rounded-2xl", iconTone)}>
              {resolvedIcon}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {message}
              </p>
            </div>

            {!isDenied && onRetry && (
              <Button onClick={onRetry} className="rounded-xl gap-2">
                <RefreshCcw className="h-4 w-4" />
                {retryLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
