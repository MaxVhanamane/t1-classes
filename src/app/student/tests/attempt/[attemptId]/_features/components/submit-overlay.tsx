"use client";

import { Loader2, WifiOff, RefreshCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useSubmissionGuard } from "../hooks/use-submission-guard";
import { useRouter } from "nextjs-toploader/app";

type Props = {
  visible: boolean;
  failed: boolean;
  onRetry: () => void;
};

export default function SubmitOverlay({ visible, failed, onRetry }: Props) {
  // Guard only while submitting (not after failure)
  const router = useRouter();
  useSubmissionGuard({ active: visible && !failed });

  if (!visible && !failed) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300 px-4">
      {/* Card */}
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl border bg-background/95 p-8 text-center shadow-2xl",
          "animate-in zoom-in-95 duration-300",
        )}
      >
        {/* Status Icon */}
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          {/* Glow Ring */}
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-40",
              failed ? "bg-destructive" : "bg-primary",
            )}
          />

          {/* Icon Circle */}
          <div
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full border",
              failed
                ? "border-destructive/40 bg-destructive/10"
                : "border-primary/40 bg-primary/10",
            )}
          >
            {!failed ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <WifiOff className="h-8 w-8 text-destructive" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold tracking-tight">
          {!failed ? "Submitting your test…" : "Submission Failed"}
        </h2>

        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {!failed
            ? "Please wait while we securely upload your answers. Don’t close or refresh this tab."
            : "We couldn’t submit your test due to a network error. Please retry."}
        </p>

        {/* Progress bar */}
        {!failed && (
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3">
          {/* Retry */}
          {failed && (
            <Button
              onClick={onRetry}
              variant="destructive"
              className="mt-6 w-full gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry Submission
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => router.push("/student/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
