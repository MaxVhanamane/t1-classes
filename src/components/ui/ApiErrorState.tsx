"use client";

import {
  AlertTriangle,
  ShieldX,
  RefreshCcw,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { motion } from "motion/react";

import { ApiError } from "@/src/lib/helper-functions/api-error-class";

type Props = {
  error: unknown;
  onRetry?: () => void;
};

export function ApiErrorState({ error, onRetry }: Props) {
  // ---------------------------------------------
  // Denied detection
  // ---------------------------------------------
  const isDenied =
    error instanceof ApiError &&
    error.info &&
    typeof error.info === "object" &&
    "kind" in error.info &&
    (error.info as { kind?: string }).kind === "denied";

  // ---------------------------------------------
  // Reason mapping
  // ---------------------------------------------
  let title = "Something went wrong";
  let message =
    "An unexpected server error occurred while loading this data. Please try again.";
  let icon = <AlertTriangle className="h-10 w-10 text-red-600" />;
  let iconTone = "bg-red-500/10";

  if (isDenied) {
    const reason = (error.info as { reason?: string }).reason ?? "";

    // -------------------------------
    // Ownership
    // -------------------------------
    if (reason === "not_owner") {
      title = "Access Restricted";
      message = "This result does not belong to your account.";
      icon = <ShieldX className="h-10 w-10 text-amber-600" />;
      iconTone = "bg-amber-500/10";
    }

    // -------------------------------
    // Enrollment
    // -------------------------------
    else if (reason === "not_enrolled") {
      title = "Enrollment Required";
      message = "You need to be enrolled to view this result.";
      icon = <ShieldX className="h-10 w-10 text-amber-600" />;
      iconTone = "bg-amber-500/10";
    }

    // -------------------------------
    // Result missing
    // -------------------------------
    else if (reason === "not_found") {
      title = "Result not found";
      message =
        "We couldn’t find the requested result. It may have been removed or never existed.";
      icon = <AlertTriangle className="h-10 w-10 text-amber-600" />;
      iconTone = "bg-amber-500/10";
    }

    // -------------------------------
    // Attempt not found (NEW DESIGN)
    // -------------------------------
    else if (reason === "attempt_not_found") {
      title = "You didn’t attempt this test";

      message =
        "It looks like you did not attempt this test. Because no attempt was recorded, a result is not available.";

      icon = <ClipboardList className="h-10 w-10 text-primary" />;

      iconTone = "bg-primary/10";
    }
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="flex items-center justify-center p-6 sm:p-10 h-(--h-viewport-minus-navbar)">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className=" rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center text-center gap-6 p-10">
            {/* Icon */}
            <div className={`p-5 rounded-2xl ${iconTone}`}>{icon}</div>

            {/* Title + Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {message}
              </p>
            </div>

            {/* Retry only for real errors */}
            {!isDenied && onRetry && (
              <Button onClick={onRetry} className="rounded-xl gap-2">
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
