"use client";

import { CheckCircle2, Pencil, XCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

import { AttendanceStudentSession } from "../../types/attendance";

import { cn } from "@/src/lib/utils";

type StudentReportSessionCardProps = {
  session: AttendanceStudentSession;

  onEdit: (session: AttendanceStudentSession) => void;
};

export function StudentReportSessionCard({
  session,
  onEdit,
}: StudentReportSessionCardProps) {
  const isPresent = session.status === "present";

  const attendanceDate = new Date(session.attendance_date);

  const formattedDate = attendanceDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const weekday = attendanceDate.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  const updatedDate = session.updated_at ? new Date(session.updated_at) : null;

  const updatedFormattedDate = updatedDate?.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const updatedWeekday = updatedDate?.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 py-4",
        isPresent
          ? "border-l-4 border-l-emerald-500"
          : "border-l-4 border-l-red-500",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{formattedDate}</p>

            <p className="text-muted-foreground mt-1 text-sm">{weekday}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {isPresent ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}

              <span
                className={
                  isPresent
                    ? "text-sm font-medium text-emerald-600"
                    : "text-sm font-medium text-destructive"
                }
              >
                {isPresent ? "Present" : "Absent"}
              </span>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onEdit(session)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-muted/40 mt-3 rounded-lg px-3 py-2">
          <p className="text-muted-foreground text-xs">Marked By</p>

          <p className="text-sm font-medium">
            {session.created_by_name ?? "Unknown"}
          </p>
        </div>

        {session.updated_at && session.updated_by_name && (
          <div className="bg-muted/40 mt-2 rounded-lg px-3 py-2">
            <p className="text-muted-foreground text-xs">Last Updated By</p>

            <p className="text-sm font-medium">{session.updated_by_name}</p>

            <p className="text-muted-foreground mt-1 text-xs">
              {updatedFormattedDate}
              {updatedFormattedDate && updatedWeekday && " • "}
              {updatedWeekday}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
