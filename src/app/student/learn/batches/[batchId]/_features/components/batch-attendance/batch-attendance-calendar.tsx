"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { CheckCircle2, XCircle, Info } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { Skeleton } from "@/src/components/ui/skeleton";
import DottedBackground from "@/src/components/dotted-background";
import { cn } from "@/src/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DailyRecord = {
  date: string;
  status: "present" | "absent";
};

type Props = {
  month: number;
  year: number;
  records: DailyRecord[];
  isLoading?: boolean;
  isFetching?: boolean;
};

export function BatchAttendanceCalendar({
  month,
  year,
  records,
  isLoading,
  isFetching,
}: Props) {
  // Map records by date for O(1) lookup
  const recordsByDate = useMemo(() => {
    const map = new Map<string, "present" | "absent">();
    records.forEach((record) => {
      map.set(record.date, record.status);
    });
    return map;
  }, [records]);

  // Calendar math
  const monthDate = new Date(year, month - 1);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const startDateOffset = getDay(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Card className="overflow-hidden border shadow-sm dark:bg-black w-full max-w-[380px]">
      <CardContent className="p-4 sm:p-4 relative">
        <DottedBackground />

        <div
          className={cn(
            "transition-all duration-300 relative z-10",
            // Only apply the semi-transparent pulse if it's refetching new data
            !isLoading && isFetching
              ? "animate-pulse opacity-70 pointer-events-none"
              : "opacity-100",
          )}
        >
          {/* Weekday Headers (Always visually stable) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-3">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots for days before the 1st of the month */}
            {Array.from({ length: startDateOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const status = recordsByDate.get(dateKey);
              const title = format(day, "EEEE, MMMM do");

              // Determine styling based on status
              let popoverColor: "gray" | "green" | "red" = "gray";
              let cellStyle =
                "bg-background hover:bg-muted border-border/40 text-foreground font-medium";

              if (!isLoading) {
                if (status === "present") {
                  popoverColor = "green";
                  cellStyle =
                    "border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold";
                } else if (status === "absent") {
                  popoverColor = "red";
                  cellStyle =
                    "border-rose-500/50 dark:border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold";
                }
              }

              const cellContent = (
                <div
                  className={cn(
                    "relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border shadow-sm transition-colors",
                    cellStyle,
                  )}
                >
                  {/* Inner Skeleton Logic matches Homework perfectly */}
                  {isLoading ? (
                    <Skeleton className="size-4 rounded-full" />
                  ) : (
                    <span className="text-xs sm:text-sm">
                      {format(day, "d")}
                    </span>
                  )}

                  {!isLoading && status === "present" && (
                    <div className="absolute bottom-1 sm:bottom-1.5 size-1 sm:size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  )}
                  {!isLoading && status === "absent" && (
                    <div className="absolute bottom-1 sm:bottom-1.5 size-1 sm:size-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  )}
                </div>
              );

              // Don't wrap in popover if loading or if there's no record
              if (isLoading || !status) {
                return <div key={dateKey}>{cellContent}</div>;
              }

              return (
                <RichPopover
                  key={dateKey}
                  color={popoverColor}
                  title={title}
                  trigger={
                    <button type="button" className="focus:outline-none w-full">
                      {cellContent}
                    </button>
                  }
                >
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Attendance
                    </span>
                    {status === "present" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> Present
                      </span>
                    ) : status === "absent" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        <XCircle className="size-3.5" /> Absent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-background px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
                        <Info className="size-3.5" /> Not Taken
                      </span>
                    )}
                  </div>
                </RichPopover>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
