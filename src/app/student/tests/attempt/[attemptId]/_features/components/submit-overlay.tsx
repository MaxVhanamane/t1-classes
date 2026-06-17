"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
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
  const router = useRouter();

  // Guard only while actively submitting
  useSubmissionGuard({
    active: visible && !failed,
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible || failed) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);

    let current = 0;

    const interval = setInterval(() => {
      current += Math.max((95 - current) * 0.08, 0.5);

      if (current >= 95) {
        current = 95;
      }

      setProgress(current);
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [visible, failed]);

  if (!visible && !failed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl border bg-background/95 p-8 text-center shadow-2xl",
          "animate-in zoom-in-95 duration-300",
        )}
      >
        {/* Status Icon */}
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-40",
              failed ? "bg-destructive" : "bg-primary",
            )}
          />

          <div
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full border",
              failed
                ? "border-destructive/40 bg-destructive/10"
                : "border-primary/40 bg-primary/10",
            )}
          >
            {failed ? (
              <WifiOff className="h-8 w-8 text-destructive" />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold tracking-tight">
          {failed ? "Submission Failed" : "Submitting your test…"}
        </h2>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {failed
            ? "We couldn’t submit your test due to a network error. Please retry."
            : "Please wait while we securely upload your answers. Don’t close or refresh this tab."}
        </p>

        {/* Progress */}
        {!failed && (
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
            />
          </div>
        )}

        {/* Actions */}
        {failed && (
          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={onRetry}
              variant="destructive"
              className="w-full gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry Submission
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => router.push("/student/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
