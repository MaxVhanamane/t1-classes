"use client";

import { AlertTriangle, BookOpen, Info, Users } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Progress } from "@/src/components/ui/progress";

import { AttendanceBatchReportSummary as AttendanceBatchReportSummaryType } from "../../types/attendance";

type BatchReportSummaryProps = {
  summary: AttendanceBatchReportSummaryType;
};

export function BatchReportSummary({ summary }: BatchReportSummaryProps) {
  const studentLabel = summary.below_75_count === 1 ? "student" : "students";
  return (
    <Card className="overflow-hidden border-border/60 h-full">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Attendance Report</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {summary.batch_title}
            </h2>
          </div>

          {summary.below_75_count > 0 && (
            <Badge variant="secondary" className="w-fit gap-1.5 text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              {summary.below_75_count} {studentLabel} below 75%
            </Badge>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="bg-muted rounded-lg p-2">
              <Users className="h-4 w-4" />
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Total Students</p>

              <p className="text-2xl font-semibold">{summary.total_students}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-muted rounded-lg p-2">
              <BookOpen className="h-4 w-4" />
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Active Students</p>

              <p className="text-2xl font-semibold">
                {summary.active_students}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">Overall Attendance</span>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Attendance calculation info"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-80 space-y-3">
                  <div>
                    <p className="font-medium">How is this calculated?</p>

                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      Overall attendance measures attendance across the entire
                      batch for the selected date range.
                    </p>
                  </div>

                  <div className="bg-muted rounded-md p-3 space-y-2 text-sm">
                    <p className="font-medium">Formula</p>

                    <p>
                      Attendance % = (Attended Classes ÷ Total Classes) × 100
                    </p>

                    <p className="text-muted-foreground">
                      Example: If students attended 340 out of 400 class
                      opportunities, attendance = (340 ÷ 400) × 100 = 85%.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <span className="text-lg font-semibold">
              {summary.average_attendance}%
            </span>
          </div>

          <Progress value={summary.average_attendance} />
        </div>
      </CardContent>
    </Card>
  );
}
