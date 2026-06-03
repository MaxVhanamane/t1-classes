"use client";

import { LayoutGroup, motion } from "motion/react";

import { cn } from "@/src/lib/utils";

import {
  AttendanceStatus,
  AttendanceStudentItem,
} from "../../types/attendance";
import { Button } from "@/src/components/ui/button";

type AttendanceStudentCardProps = {
  student: AttendanceStudentItem;
  onStatusChange: (enrollmentId: string, status: AttendanceStatus) => void;
};

export function AttendanceStudentCard({
  student,
  onStatusChange,
}: AttendanceStudentCardProps) {
  const isPresent = student.status === "present";
  const isAbsent = student.status === "absent";

  return (
    <motion.div
      layout
      transition={{
        layout: {
          type: "spring",
          stiffness: 500,
          damping: 35,
        },
      }}
      className="rounded-2xl border bg-card p-3 shadow-none"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Student Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            {/* Premium Status Dot */}
            <div className="mt-1 shrink-0">
              <div
                className={cn(
                  "relative h-2 w-2 rounded-full",
                  isPresent ? "bg-emerald-500" : "bg-red-500",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 animate-pulse rounded-full opacity-30",
                    isPresent ? "bg-emerald-500" : "bg-red-500",
                  )}
                />

                <div
                  className={cn(
                    "absolute -inset-1 rounded-full",
                    isPresent ? "bg-emerald-500/15" : "bg-red-500/15",
                  )}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="line-clamp-2 text-sm font-semibold leading-tight md:text-base"
                title={student.full_name}
              >
                {student.full_name}
              </h3>

              <div className="mt-1">
                <span className="inline-flex items-center rounded-full border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Roll {student.roll_number}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Toggle */}

        <LayoutGroup>
          <div className="flex w-full rounded-xl border bg-muted/50 p-1 sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onStatusChange(student.enrollment_id, "present")}
              className="relative h-8 flex-1 rounded-lg px-3 text-sm font-medium sm:min-w-[90px]"
            >
              {isPresent && (
                <motion.div
                  layoutId={`attendance-pill-${student.enrollment_id}`}
                  className="absolute inset-0 rounded-lg bg-emerald-500 shadow-sm"
                  transition={{
                    type: "spring",
                    stiffness: 550,
                    damping: 28,
                    bounce: 0.35,
                  }}
                />
              )}

              <span
                className={cn(
                  "relative z-10 transition-colors",
                  isPresent ? "text-white" : "text-muted-foreground",
                )}
              >
                Present
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => onStatusChange(student.enrollment_id, "absent")}
              className="relative h-8 flex-1 rounded-lg px-3 text-sm font-medium sm:min-w-[90px]"
            >
              {isAbsent && (
                <motion.div
                  layoutId={`attendance-pill-${student.enrollment_id}`}
                  className="absolute inset-0 rounded-lg bg-red-500 shadow-sm"
                  transition={{
                    type: "spring",
                    stiffness: 550,
                    damping: 28,
                    bounce: 0.35,
                  }}
                />
              )}

              <span
                className={cn(
                  "relative z-10 transition-colors",
                  isAbsent ? "text-white" : "text-muted-foreground",
                )}
              >
                Absent
              </span>
            </Button>
          </div>
        </LayoutGroup>
      </div>
    </motion.div>
  );
}
