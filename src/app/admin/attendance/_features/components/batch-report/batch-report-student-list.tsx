"use client";

import { AttendanceBatchReportRow } from "../../types/attendance";

import { BatchReportStudentCard } from "./batch-report-student-card";

type BatchReportStudentListProps = {
  students: AttendanceBatchReportRow[];
};

export function BatchReportStudentList({
  students,
}: BatchReportStudentListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {students.map((student) => (
        <BatchReportStudentCard key={student.enrollment_id} student={student} />
      ))}
    </div>
  );
}
