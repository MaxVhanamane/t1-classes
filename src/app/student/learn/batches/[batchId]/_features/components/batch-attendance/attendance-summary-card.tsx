"use client";

import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

import { CountUpNumber } from "@/src/app/student/tests/results/[attemptId]/_features/components/count-up-number";

type Props = {
  attendancePercentage: number;

  presentCount: number;

  absentCount: number;

  totalClasses: number;
};

export function AttendanceSummaryCard({
  attendancePercentage,
  presentCount,
  absentCount,
  totalClasses,
}: Props) {
  const attendance = Number(attendancePercentage) || 0;

  const attendanceLabel =
    attendance >= 90
      ? "Excellent"
      : attendance >= 75
        ? "Good Standing"
        : attendance >= 60
          ? "Average"
          : "Needs Improvement";

  return (
    <Card className="relative overflow-hidden border bg-inverse bg-linear-to-br from-background via-background to-muted/30 backdrop-blur">
      <DottedBackground />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Attendance Rate</p>

            <h2 className="mt-1 text-5xl font-bold tracking-tight">
              <CountUpNumber
                start={true}
                value={parseFloat(attendance.toFixed(1))}
                duration={1}
              />{" "}
              %
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />

              <span className="text-sm font-medium">{attendanceLabel}</span>
            </div>
          </div>
        </div>

        <div className="bg-muted mt-6 h-3 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{
              width: `${attendance}%`,
            }}
          />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 pt-6 lg:gap-6">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Present
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold text-emerald-500">
                <CountUpNumber start={true} value={presentCount} duration={1} />
              </span>

              <span className="text-muted-foreground mb-1 text-sm">
                {presentCount === 1 ? "class" : "classes"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Absent
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold text-red-500">
                <CountUpNumber start={true} value={absentCount} duration={1} />
              </span>

              <span className="text-muted-foreground mb-1 text-sm">
                {absentCount === 1 ? "class" : "classes"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Total
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold">
                {" "}
                <CountUpNumber start={true} value={totalClasses} duration={1} />
              </span>

              <span className="text-muted-foreground mb-1 text-sm">
                {totalClasses === 1 ? "class" : "classes"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
