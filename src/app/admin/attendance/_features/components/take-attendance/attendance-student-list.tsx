"use client";

import { useMemo, useState } from "react";

import { Input } from "@/src/components/ui/input";

import {
  AttendanceStatus,
  AttendanceStudentItem,
} from "../../types/attendance";

import { AttendanceStudentCard } from "./attendance-student-card";

type AttendanceStudentListProps = {
  students: AttendanceStudentItem[];

  onStatusChange: (enrollmentId: string, status: AttendanceStatus) => void;
};

export function AttendanceStudentList({
  students,
  onStatusChange,
}: AttendanceStudentListProps) {
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(query) ||
        String(student.roll_number).includes(query),
    );
  }, [students, search]);

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Input
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-w-2xl space-y-2 mb-20">
        {filteredStudents.map((student) => (
          <AttendanceStudentCard
            key={student.enrollment_id}
            student={student}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
