"use client";

import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import { AttendanceRecentCard } from "./attendance-recent-card";
import DottedBackground from "@/src/components/dotted-background";

type RecentSession = {
  attendance_date: string;

  status: "present" | "absent";
};

type Props = {
  sessions: RecentSession[];
};

export function AttendanceRecentList({ sessions }: Props) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Recent Attendance</h3>

        <span className="text-muted-foreground text-sm">
          {sessions.length} {sessions.length === 1 ? "record" : "records"}
        </span>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-dashed dark:bg-black relative">
          <DottedBackground />
          <CardContent className="py-12 text-center">
            <CalendarDays className="text-muted-foreground mx-auto mb-3 h-8 w-8" />

            <p className="text-muted-foreground text-sm">
              No attendance records found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sessions.map((session, index) => (
            <AttendanceRecentCard
              key={`${session.attendance_date}-${session.status}-${index}`}
              attendanceDate={session.attendance_date}
              status={session.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
