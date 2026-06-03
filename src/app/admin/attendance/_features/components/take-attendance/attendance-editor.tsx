"use client";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import {
  AttendanceStatus,
  AttendanceSessionDetail,
} from "../../types/attendance";

import { useSaveAttendanceRecords } from "../../hooks/use-save-attendance-records";

import { AttendanceSessionHeader } from "./attendance-session-header";
import { AttendanceStudentList } from "./attendance-student-list";
import { AttendanceSaveBar } from "./attendance-save-bar";

type AttendanceEditorProps = {
  session: AttendanceSessionDetail;
};

export function AttendanceEditor({ session }: AttendanceEditorProps) {
  const [students, setStudents] = useState(session.students);

  const [originalStudents, setOriginalStudents] = useState(session.students);

  const saveAttendanceMutation = useSaveAttendanceRecords();

  const changedStudents = useMemo(() => {
    const originalMap = new Map(
      originalStudents.map((student) => [
        student.enrollment_id,
        student.status,
      ]),
    );

    return students.filter(
      (student) => originalMap.get(student.enrollment_id) !== student.status,
    );
  }, [students, originalStudents]);

  const changedCount = changedStudents.length;

  const presentCount = students.filter(
    (student) => student.status === "present",
  ).length;

  const absentCount = students.filter(
    (student) => student.status === "absent",
  ).length;

  function handleStatusChange(enrollmentId: string, status: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        student.enrollment_id === enrollmentId
          ? {
              ...student,
              status,
            }
          : student,
      ),
    );
  }

  async function handleSaveAttendance() {
    if (changedCount === 0) {
      return;
    }

    try {
      await saveAttendanceMutation.mutateAsync({
        session_id: session.id,

        records: changedStudents.map((student) => ({
          enrollment_id: student.enrollment_id,

          status: student.status,
        })),
      });

      setOriginalStudents(students);

      toast.success("Attendance saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save attendance",
      );
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <AttendanceSessionHeader
        batchTitle={session.batch_title}
        totalStudents={students.length}
        presentCount={presentCount}
        absentCount={absentCount}
        createdAt={session.created_at}
        createdByName={session.created_by_name}
      />

      <AttendanceStudentList
        students={students}
        onStatusChange={handleStatusChange}
      />

      <AttendanceSaveBar
        changedCount={changedCount}
        isSaving={saveAttendanceMutation.isPending}
        onSave={handleSaveAttendance}
      />
    </div>
  );
}
