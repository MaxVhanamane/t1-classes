"use client";

import { Info } from "lucide-react";

import { cn } from "@/src/lib/utils";

import { Card, CardContent } from "@/src/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { AttendanceBatchReportRow } from "../../types/attendance";

type BatchReportStudentCardProps = {
  student: AttendanceBatchReportRow;
};

export function BatchReportStudentCard({
  student,
}: BatchReportStudentCardProps) {
  const attendance = Number(student.attendance_percentage) || 0;

  const attendanceLabel = `${attendance.toFixed(1)}%`;

  const attendanceStyles =
    attendance >= 90
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : attendance >= 75
        ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400"
        : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400";

  return (
    <Card className="border-border/60 transition-colors hover:border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Roll No. {student.roll_number}
            </p>

            <h3 className="mt-1 truncate text-base font-semibold">
              {student.full_name}
            </h3>
          </div>

          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-center",
              attendanceStyles,
            )}
          >
            <p className="text-lg font-semibold">{attendanceLabel}</p>

            <p className="text-[10px] uppercase tracking-wide opacity-70">
              Attendance
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x rounded-lg border border-border/50 bg-muted/20">
          <div className="p-3 text-center">
            <p className="text-muted-foreground text-xs">Present</p>

            <p className="mt-1 text-base font-semibold">
              {student.present_count}
            </p>
          </div>

          <div className="p-3 text-center">
            <p className="text-muted-foreground text-xs">Absent</p>

            <p className="mt-1 text-base font-semibold">
              {student.absent_count}
            </p>
          </div>

          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-muted-foreground text-xs">Total Classes</p>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>

                <PopoverContent align="center" className="w-72 text-sm">
                  Total classes considered for this report.
                  <div className="mt-2 text-muted-foreground">
                    If a date range is selected, this count includes only
                    classes within that range. If &quot;Today&quot; is selected,
                    it includes only today&apos;s classes.
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <p className="mt-1 text-base font-semibold">
              {student.classes_during_enrollment}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
