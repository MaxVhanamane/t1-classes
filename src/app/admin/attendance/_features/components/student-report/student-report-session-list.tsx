"use client";

import { AttendanceStudentSession } from "../../types/attendance";

import { AttendanceEmptyState } from "../shared/attendance-empty-state";

import { StudentReportSessionCard } from "./student-report-session-card";

type StudentReportSessionListProps = {
  sessions: AttendanceStudentSession[];

  onEdit: (session: AttendanceStudentSession) => void;
};

export function StudentReportSessionList({
  sessions,
  onEdit,
}: StudentReportSessionListProps) {
  if (sessions.length === 0) {
    return (
      <AttendanceEmptyState
        title="No Sessions Found"
        description="No attendance records were found for the selected filters."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {sessions.map((session) => (
        <StudentReportSessionCard
          key={session.attendance_record_id}
          session={session}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
