"use client";

import { Info } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { AttendanceStudentReportSummary as AttendanceStudentReportSummaryType } from "../../types/attendance";

type StudentReportSummaryProps = {
  summary: AttendanceStudentReportSummaryType;
};

function InfoLabel({
  label,
  description,
}: {
  label: string;

  description: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="center" className="max-w-xs text-sm">
          {description}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function StudentReportSummary({ summary }: StudentReportSummaryProps) {
  const attendance = Number(summary.attendance_percentage) || 0;

  return (
    <Card className="border-border/60 overflow-hidden pt-0 h-full">
      <CardContent className="p-0">
        <div className="bg-muted/30 px-4 py-3">
          <p className="text-muted-foreground text-xs">
            Roll No. {summary.roll_number}
          </p>

          <h2 className="truncate text-lg font-semibold">
            {summary.full_name}
          </h2>

          <p className="text-muted-foreground truncate text-xs">
            {summary.batch_title}
          </p>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Attendance
              </p>

              <p className="text-2xl font-bold">{attendance.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-4">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Present</p>
              <p className="text-lg font-semibold">{summary.present_count}</p>
            </div>

            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Absent</p>
              <p className="text-lg font-semibold">{summary.absent_count}</p>
            </div>

            <div className="bg-muted/40 rounded-lg p-3">
              <InfoLabel
                label="Eligible Classes"
                description="Classes that were counted for this student's attendance during the selected period.

Example: If the batch conducted 20 classes during the selected dates, but only 15 classes fell within this student's enrollment period, Eligible Classes will be 15."
              />

              <p className="mt-1 text-lg font-semibold">
                {summary.classes_during_enrollment}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg p-3">
              <InfoLabel
                label="Batch Classes"
                description="Total classes conducted in this batch during the selected period.

Example: If attendance was taken 20 times between the selected dates, Batch Classes will be 20."
              />

              <p className="mt-1 text-lg font-semibold">
                {summary.total_batch_classes}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
