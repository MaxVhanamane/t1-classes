"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";

type AttendanceSaveBarProps = {
  changedCount: number;
  isSaving: boolean;
  onSave: () => void;
};

export function AttendanceSaveBar({
  changedCount,
  isSaving,
  onSave,
}: AttendanceSaveBarProps) {
  const isVisible = changedCount > 0 || isSaving;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className="fixed inset-x-0 bottom-4 z-50 px-4"
        >
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border bg-background/95 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <CheckCircle2 className="text-primary h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold sm:text-base">
                      {changedCount} attendance{" "}
                      {changedCount === 1 ? "update" : "updates"}
                    </p>

                    <p className="text-muted-foreground text-sm">
                      Mark attendance for all students, then save.
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={onSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Attendance</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
