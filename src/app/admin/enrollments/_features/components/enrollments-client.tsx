"use client";

import { useState } from "react";
import { EnrollmentTable } from "./enrollment-table";
import { EnrollmentDialog } from "./enrollment-dialog";
import { BatchOption, CourseOption, EnrollmentRow } from "../types/enrollments";
import { EnrollmentCards } from "./enrollment-cards";
import { EnrollmentHeader } from "./enrollment-header";

type EnrollmentsClientProps = {
  enrollments: EnrollmentRow[];
  batches: BatchOption[];
  courses: CourseOption[];
};

export function EnrollmentsClient({
  enrollments,
  batches,
  courses,
}: EnrollmentsClientProps) {
  const [open, setOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] =
    useState<EnrollmentRow | null>(null);

  return (
    <div className="space-y-6">
      {open && (
        <EnrollmentDialog
          batches={batches}
          courses={courses}
          enrollment={editingEnrollment}
          onClose={() => {
            setOpen(false);
            setEditingEnrollment(null);
          }}
        />
      )}

      <EnrollmentHeader
        onCreate={() => {
          setOpen(true);
          setEditingEnrollment(null);
        }}
      />
      {/* DESKTOP */}
      <div className="hidden md:block">
        <EnrollmentTable
          enrollments={enrollments}
          onEdit={(enrollment) => {
            setEditingEnrollment(enrollment);
            setOpen(true);
          }}
        />
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <EnrollmentCards
          enrollments={enrollments}
          onEdit={(enrollment) => {
            setEditingEnrollment(enrollment);
            setOpen(true);
          }}
        />
      </div>
    </div>
  );
}
