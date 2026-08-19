"use client";

import { format } from "date-fns";
import {
  BookOpen,
  FileCheck2,
  FileText,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import DottedBackground from "@/src/components/dotted-background";
import { cn } from "@/src/lib/utils";
import { StudentHomeworkRow } from "../../types/homework.types";

type Props = {
  homework: StudentHomeworkRow;
  onViewPdf: (url: string, title: string) => void;
};

export function BatchHomeworkCard({ homework, onViewPdf }: Props) {
  const isScheduled = new Date(homework.publish_date) > new Date();
  const isPastDueDate = new Date(homework.due_date) < new Date();

  // Logic to determine if solution should be shown
  const isSolutionUnlocked =
    homework.is_solution_visible ||
    (homework.auto_publish_solution_at &&
      new Date(homework.auto_publish_solution_at) <= new Date());

  // Ultra-compact badge logic
  let statusBadge;
  if (isScheduled) {
    statusBadge = (
      <span className="inline-flex items-center rounded-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        Scheduled
      </span>
    );
  } else if (homework.is_completed) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="size-2.5 sm:size-3" /> Done
      </span>
    );
  } else if (isPastDueDate) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <Clock className="size-2.5 sm:size-3" /> Not Done
      </span>
    );
  } else {
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock className="size-2.5 sm:size-3" /> Pending
      </span>
    );
  }

  return (
    <Card className="relative flex flex-col overflow-hidden rounded-xl border shadow-sm py-1 transition hover:shadow-md dark:bg-black w-full md:max-w-2xl">
      <DottedBackground className="opacity-40" />

      <CardContent className="relative z-10 p-4 sm:p-5 flex flex-col flex-1 gap-4">
        {/* --- Top Section: Title & Meta --- */}
        <div className="flex flex-col w-full">
          {/* 1. Title Row: Perfectly centered vertically via items-center */}
          <div className="flex items-center justify-between gap-3 w-full">
            {/* Left side: Title + Info Button */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="truncate text-sm sm:text-base font-semibold tracking-tight text-foreground md:text-lg">
                {homework.title}
              </h3>

              <RichPopover
                color="yellow"
                title={homework.title}
                description={
                  homework.description ||
                  "No description provided for this assignment."
                }
                trigger={
                  <button
                    type="button"
                    className="shrink-0 flex items-center justify-center focus:outline-none"
                    aria-label="View description"
                  >
                    <Info className="size-4 sm:size-4.5 text-muted-foreground transition-colors hover:text-foreground" />
                  </button>
                }
              />
            </div>

            {/* Right side: Compact Status Badge */}
            <div className="shrink-0">{statusBadge}</div>
          </div>

          {/* 2. Subject & Chapter Row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <BookOpen className="size-3 sm:size-3.5 shrink-0" />{" "}
              <span className="truncate">{homework.chapter_name}</span>
            </span>
            <span className="capitalize flex items-center gap-1">
              Subject:{" "}
              <span className="font-medium text-foreground">
                {homework.subject}
              </span>
            </span>
          </div>
        </div>

        {/* --- Bottom Row: Dates & Actions --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 mt-auto">
          <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0">
                {isScheduled ? "Opens At:" : "Opened:"}
              </span>
              <span className="font-medium">
                {format(
                  new Date(homework.publish_date),
                  "dd MMM yyyy, hh:mm a",
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0">Due By:</span>
              <span
                className={cn(
                  "font-medium",
                  isPastDueDate &&
                    !homework.is_completed &&
                    "text-rose-500 dark:text-rose-400",
                )}
              >
                {format(new Date(homework.due_date), "dd MMM yyyy, hh:mm a")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full mt-3 sm:mt-0 sm:w-auto">
            {isScheduled ? (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="flex-1 sm:flex-none h-8 text-[11px] sm:text-xs"
              >
                Locked
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  className="flex-1 sm:flex-none h-8 text-[11px] sm:text-xs px-2 sm:px-3 shadow-sm"
                  onClick={() =>
                    onViewPdf(
                      homework.file_path,
                      `${homework.title} - Question`,
                    )
                  }
                >
                  <FileText className="size-3 sm:size-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">Assignment</span>
                </Button>

                {homework.solution_file_path && isSolutionUnlocked && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none h-8 text-[11px] sm:text-xs px-2 sm:px-3 bg-green-500/5 hover:bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                    onClick={() =>
                      onViewPdf(
                        homework.solution_file_path!,
                        `${homework.title} - Solution`,
                      )
                    }
                  >
                    <FileCheck2 className="size-3 sm:size-3.5 mr-1.5 shrink-0" />
                    <span className="truncate">Solution</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
