"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { cn } from "@/src/lib/utils";

import { callServerAction } from "@/src/lib/actions/call-server-action";
import { useStudentsForMarking } from "../../hooks/marking/use-students-for-marking";
import type { BatchAssignmentRow } from "../../types/batch-assignments.types";
import { bulkSaveSubmissions } from "../../../actions/marking/bulk-save-submissions";
import { RichPopover } from "@/src/components/ui/common/rich-popover";

type Props = {
  batchId: string;
  assignment: BatchAssignmentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MarkAssignmentsSheet({
  batchId,
  assignment,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>(
    {},
  );

  const { data: students = [], isLoading } = useStudentsForMarking(
    batchId,
    assignment?.id ?? null,
  );

  useEffect(() => {
    if (!open) setPendingChanges({});
  }, [open]);

  const handleToggle = (
    studentId: string,
    currentDbState: boolean,
    newValue: boolean,
  ) => {
    setPendingChanges((prev) => {
      const next = { ...prev };
      if (newValue === currentDbState) {
        delete next[studentId];
      } else {
        next[studentId] = newValue;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!assignment) return;

    const changesCount = Object.keys(pendingChanges).length;
    if (changesCount === 0) return;

    const toastId = toast.loading(`Saving ${changesCount} changes...`);
    setSaving(true);

    try {
      const payload = Object.entries(pendingChanges).map(
        ([studentId, isCompleted]) => ({
          student_id: studentId,
          is_completed: isCompleted,
        }),
      );

      const { error } = await callServerAction(
        bulkSaveSubmissions(assignment.id, payload),
      );

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      toast.success("Submissions saved successfully!", { id: toastId });

      await queryClient.invalidateQueries({
        queryKey: ["admin", "marking-students", batchId, assignment.id],
      });

      setPendingChanges({});
    } catch {
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const changesCount = Object.keys(pendingChanges).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onInteractOutside={(e) => e.preventDefault()}
        className="w-full sm:max-w-xl flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-4 md:px-6 py-5 border-b bg-muted/10">
          <div>
            <SheetTitle className="text-lg md:text-xl font-semibold">
              Mark Submissions
            </SheetTitle>
            <SheetDescription className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-muted-foreground">
              {assignment?.material.title}
            </SheetDescription>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="info" className="border-none">
              <AccordionTrigger className="py-2 text-xs md:text-sm text-muted-foreground hover:no-underline">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>How marking works</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-2 leading-relaxed">
                By default, everyone is marked as Completed. Simply tap the
                toggle to mark a student as not done.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pt-4 p-2 sm:p-4 md:p-6 pb-40">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              No students found in this batch.
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4 pb-40">
              {students.map((student) => {
                const isCompleted =
                  pendingChanges[student.studentId] ?? student.isCompleted;

                return (
                  <motion.div
                    layout
                    key={student.studentId}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      },
                    }}
                    className={cn(
                      "rounded-2xl border bg-card p-3 md:p-4 shadow-none transition-colors",
                      !student.isActive && "opacity-60 bg-muted/30",
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left Side: Student Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {student.rollNumber && (
                                <span className="inline-flex items-center rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  Roll {student.rollNumber}
                                </span>
                              )}
                              <h3
                                className="truncate text-sm font-semibold leading-tight md:text-[15px]"
                                title={student.fullName}
                              >
                                {student.fullName}
                              </h3>
                              {!student.isActive && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 px-1.5 py-0 uppercase"
                                >
                                  Inactive
                                </Badge>
                              )}
                            </div>

                            {student.markedBy && (
                              <RichPopover
                                color="indigo"
                                badgeText="Marking History"
                                title={student.fullName}
                                description={
                                  <div className="flex flex-col gap-3 mt-3">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        Initially Marked By
                                      </span>
                                      <span className="font-medium text-foreground text-sm mt-0.5">
                                        {student.markedBy}
                                      </span>
                                    </div>
                                    {student.updatedBy && (
                                      <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                          Last Updated By
                                        </span>
                                        <span className="font-medium text-foreground text-sm mt-0.5">
                                          {student.updatedBy}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                }
                                trigger={
                                  <button
                                    type="button"
                                    className="text-left w-fit max-w-full"
                                  >
                                    <span className="block text-[11px] md:text-xs text-muted-foreground hover:text-foreground transition-colors truncate">
                                      Marked by {student.markedBy}
                                      {student.updatedBy &&
                                        ` • Upd: ${student.updatedBy}`}
                                    </span>
                                  </button>
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Right Side / Bottom Row: The Animated Toggle */}
                      <LayoutGroup>
                        <div className="flex w-full shrink-0 rounded-lg border bg-muted/40 p-0.5 sm:w-auto">
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={!student.isActive}
                            onClick={() =>
                              handleToggle(
                                student.studentId,
                                student.isCompleted,
                                false,
                              )
                            }
                            className="relative h-7 flex-1 rounded-md px-3 text-[11px] font-medium sm:min-w-[85px]"
                          >
                            {!isCompleted && (
                              <motion.div
                                layoutId={`hw-pill-${student.studentId}`}
                                className="absolute inset-0 rounded-md bg-red-500 shadow-none"
                                transition={{
                                  type: "spring",
                                  stiffness: 550,
                                  damping: 28,
                                }}
                              />
                            )}
                            <span
                              className={cn(
                                "relative z-10 transition-colors",
                                !isCompleted
                                  ? "text-white"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              Not Done
                            </span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            disabled={!student.isActive}
                            onClick={() =>
                              handleToggle(
                                student.studentId,
                                student.isCompleted,
                                true,
                              )
                            }
                            className="relative h-7 flex-1 rounded-md px-3 text-[11px] font-medium sm:min-w-[85px]"
                          >
                            {isCompleted && (
                              <motion.div
                                layoutId={`hw-pill-${student.studentId}`}
                                className="absolute inset-0 rounded-md bg-emerald-500 shadow-none"
                                transition={{
                                  type: "spring",
                                  stiffness: 550,
                                  damping: 28,
                                }}
                              />
                            )}
                            <span
                              className={cn(
                                "relative z-10 transition-colors",
                                isCompleted
                                  ? "text-white"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              Completed
                            </span>
                          </Button>
                        </div>
                      </LayoutGroup>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {changesCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-border/40 bg-background/85 px-4 py-4 backdrop-blur-xl md:px-6 md:py-5 animate-in slide-in-from-bottom-4 fade-in-20 duration-300 shadow-[0_-15px_40px_-10px_rgba(0,0,0,0.05)]">
            <div className="mb-3.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </div>
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  Unsaved Changes
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/10 border-none px-2.5 font-bold"
              >
                {changesCount} {changesCount === 1 ? "Update" : "Updates"}
              </Badge>
            </div>

            <div className="flex gap-2.5 md:gap-3">
              <Button
                variant="ghost"
                className="flex-1 text-sm h-10 md:h-11 bg-muted/50 hover:bg-muted font-medium transition-colors"
                disabled={saving}
                onClick={() => setPendingChanges({})}
              >
                Discard
              </Button>
              <Button
                className="flex-1 text-sm h-10 md:h-11 font-medium shadow-sm transition-all active:scale-[0.98]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground/70">
                Tip: Flip all required toggles before saving to update in bulk.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
