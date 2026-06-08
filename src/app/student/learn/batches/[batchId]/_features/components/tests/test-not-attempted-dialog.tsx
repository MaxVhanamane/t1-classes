"use client";

import { BarChart3 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

type TestNotAttemptedDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  testTitle: string | null;
};

export function TestNotAttemptedDialog({
  open,
  onOpenChange,
  testTitle,
}: TestNotAttemptedDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="overflow-hidden rounded-2xl p-0 sm:max-w-md">
        <div className="space-y-6 p-6 sm:p-7">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl" />

              <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
            </div>

            <div className="space-y-1.5">
              <AlertDialogTitle className="text-lg font-semibold tracking-tight">
                Test Not Attempted
              </AlertDialogTitle>

              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                You did not attempt this test, so a result is not available.
              </p>
            </div>
          </div>

          {testTitle && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Test
              </p>

              <p className="line-clamp-1 text-sm font-medium text-foreground">
                {testTitle}
              </p>
            </div>
          )}

          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
            <AlertDialogAction className="w-full rounded-lg px-6 sm:w-auto">
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
