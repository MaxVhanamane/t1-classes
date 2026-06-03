"use client";

import { format } from "date-fns";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";

import { AttendanceSessionListItem } from "../../types/attendance";

type AttendanceHistoryCardProps = {
  session: AttendanceSessionListItem;

  onView: (sessionId: string) => void;
};

export function AttendanceHistoryCard({
  session,
  onView,
}: AttendanceHistoryCardProps) {
  const attendanceRate =
    session.total_students > 0
      ? Math.round((session.present_count / session.total_students) * 100)
      : 0;

  return (
    <Card className="max-w-2xl border-border/60 overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {format(new Date(session.created_at), "dd MMM yyyy")}
            </p>

            <h3 className="mt-1 text-base font-semibold md:text-lg">
              {session.batch_title}
            </h3>

            <p className="text-muted-foreground mt-1 text-sm">
              Taken by{" "}
              <span className="text-foreground font-medium">
                {session.created_by_name ?? "Unknown"}
              </span>
              {" • "}
              {format(new Date(session.created_at), "h:mm a")}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(session.id)}
            className="w-full md:w-auto"
          >
            View Attendance
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="rounded-full border px-3 py-1 text-sm">
            <span className="text-muted-foreground">Students</span>
            <span className="ml-2 font-medium">{session.total_students}</span>
          </div>

          <div className="rounded-full border px-3 py-1 text-sm">
            <span className="text-muted-foreground">Present</span>
            <span className="ml-2 font-medium text-emerald-600">
              {session.present_count}
            </span>
          </div>

          <div className="rounded-full border px-3 py-1 text-sm">
            <span className="text-muted-foreground">Absent</span>
            <span className="ml-2 font-medium text-rose-600">
              {session.absent_count}
            </span>
          </div>

          <div className="rounded-full border px-3 py-1 text-sm">
            <span className="text-muted-foreground">Attendance</span>
            <span className="ml-2 font-medium">{attendanceRate}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
