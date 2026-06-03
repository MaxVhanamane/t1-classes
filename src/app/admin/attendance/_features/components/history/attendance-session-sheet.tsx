"use client";

import { format } from "date-fns";
import { Loader, Users, XCircle } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";

import { cn } from "@/src/lib/utils";

import { useAttendanceSession } from "../../hooks/use-attendance-session";

type AttendanceSessionSheetProps = {
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AttendanceSessionSheet({
  sessionId,
  open,
  onOpenChange,
}: AttendanceSessionSheetProps) {
  const { data: session, isLoading } = useAttendanceSession(
    sessionId ?? undefined,
  );

  const presentCount =
    session?.students.filter((student) => student.status === "present")
      .length ?? 0;

  const absentCount =
    session?.students.filter((student) => student.status === "absent").length ??
    0;

  const totalStudents = session?.students.length ?? 0;

  const attendancePercentage =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full sm:max-w-xl"
      >
        {/* Accessibility */}
        <SheetTitle className="sr-only">Attendance Session Details</SheetTitle>

        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Loader className="text-muted-foreground h-6 w-6 animate-spin" />

            <div className="text-center">
              <p className="font-medium">Loading attendance session</p>

              <p className="text-muted-foreground text-sm">
                Fetching student records...
              </p>
            </div>
          </div>
        ) : !session ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <XCircle className="text-muted-foreground h-6 w-6" />

            <div className="text-center">
              <p className="font-medium">Unable to load session</p>

              <p className="text-muted-foreground text-sm">
                Please try again later
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold tracking-tight">
                {session.batch_title}
              </SheetTitle>

              <SheetDescription>
                Taken by {session.created_by_name} •{" "}
                {format(new Date(session.created_at), "dd MMM yyyy • h:mm a")}
              </SheetDescription>
            </SheetHeader>

            {/* Attendance Overview */}
            <div className="px-4 pb-3">
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-muted-foreground h-4 w-4" />

                    <span className="text-sm font-medium">Attendance Rate</span>
                  </div>

                  <span className="text-lg font-semibold">
                    {attendancePercentage}%
                  </span>
                </div>

                <div className="bg-muted mb-3 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${attendancePercentage}%`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-muted rounded-full px-2.5 py-1">
                    <span className="text-xs font-medium">
                      {presentCount} Present
                    </span>
                  </div>

                  <div className="bg-muted rounded-full px-2.5 py-1">
                    <span className="text-xs font-medium">
                      {absentCount} Absent
                    </span>
                  </div>

                  <div className="bg-muted rounded-full px-2.5 py-1">
                    <span className="text-xs font-medium">
                      {totalStudents} Students
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Students */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3 px-4 pb-4">
                {session.students.map((student) => {
                  const initials = student.full_name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const isPresent = student.status === "present";

                  return (
                    <div
                      key={student.enrollment_id}
                      className="
                        rounded-xl
                        border
                        bg-card
                        p-4
                        transition-colors
                        hover:border-border/80
                      "
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="
                              bg-muted
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              text-xs
                              font-semibold
                            "
                          >
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {student.full_name}
                            </p>

                            <p className="text-muted-foreground text-xs">
                              Roll No. {student.roll_number}
                            </p>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
                            isPresent
                              ? "border-emerald-200/60 bg-gradient-to-r from-emerald-500/[0.08] to-emerald-500/[0.03]"
                              : "border-red-200/60 bg-gradient-to-r from-red-500/[0.08] to-red-500/[0.03]",
                          )}
                        >
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full shadow-sm",
                              isPresent ? "bg-emerald-500" : "bg-red-500",
                            )}
                          />

                          <span
                            className={cn(
                              "text-xs font-semibold tracking-wide",
                              isPresent
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-red-700 dark:text-red-400",
                            )}
                          >
                            {isPresent ? "Present" : "Absent"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
