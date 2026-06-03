"use client";

import { Loader } from "lucide-react";

import { useMemo, useState } from "react";

import { Button } from "@/src/components/ui/button";

import { AttendanceEmptyState } from "../shared/attendance-empty-state";

import { StudentReportFilters } from "./student-report-filters";
import { StudentReportSummary } from "./student-report-summary";
import { StudentReportSessionList } from "./student-report-session-list";
import { EditAttendanceDialog } from "./edit-attendance-dialog";

import { useAttendanceBatches } from "../../hooks/use-attendance-batches";
import { useAttendanceStudents } from "../../hooks/use-attendance-students";
import { useAttendanceStudentReport } from "../../hooks/use-attendance-student-report";
import { useUpdateAttendanceRecord } from "../../hooks/use-update-attendance-record";

import {
  AttendanceStatus,
  AttendanceStudentSession,
} from "../../types/attendance";

import { toast } from "sonner";

export function StudentReportView() {
  const [batchId, setBatchId] = useState<string>();
  const [userId, setUserId] = useState<string>();

  const [period, setPeriod] = useState<"today" | "month" | "custom">("today");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);

  const [selectedSession, setSelectedSession] =
    useState<AttendanceStudentSession | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const currentYear = String(new Date().getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1),
  );

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const pageSize = 31;

  const [appliedFilters, setAppliedFilters] = useState<{
    batchId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }>({
    startDate: today,
    endDate: today,
  });

  const { data: batches = [], isLoading: isBatchesLoading } =
    useAttendanceBatches();

  const { data: students = [], isLoading: isStudentsLoading } =
    useAttendanceStudents(batchId);

  const reportFilters = useMemo(
    () => ({
      batchId: appliedFilters.batchId ?? "",
      userId: appliedFilters.userId ?? "",
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      page,
      pageSize,
    }),
    [appliedFilters, page, pageSize],
  );

  const {
    data: report,
    isLoading,
    isFetching,
    isError,
  } = useAttendanceStudentReport(reportFilters, {
    enabled: !!appliedFilters.batchId && !!appliedFilters.userId,
  });

  const updateAttendanceMutation = useUpdateAttendanceRecord(reportFilters);

  function handleBatchChange(value: string) {
    setBatchId(value);
    setUserId(undefined);

    setPage(1);
    setAppliedFilters({});
  }

  function handleApply() {
    if (period === "custom" && startDate && endDate && startDate > endDate) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    let resolvedStartDate: string | undefined;
    let resolvedEndDate: string | undefined;

    if (period === "today") {
      resolvedStartDate = today;
      resolvedEndDate = today;
    } else if (period === "month") {
      const month = selectedMonth.padStart(2, "0");

      const lastDay = new Date(
        Number(selectedYear),
        Number(month),
        0,
      ).getDate();

      resolvedStartDate = `${selectedYear}-${month}-01`;

      resolvedEndDate = `${selectedYear}-${month}-${String(lastDay).padStart(
        2,
        "0",
      )}`;
    } else {
      resolvedStartDate = startDate || undefined;
      resolvedEndDate = endDate || undefined;
    }

    setPage(1);

    setAppliedFilters({
      batchId,
      userId,
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
    });
  }

  function handleEdit(session: AttendanceStudentSession) {
    setSelectedSession(session);
    setIsEditDialogOpen(true);
  }

  function handleUpdateAttendance(
    attendanceRecordId: string,
    status: AttendanceStatus,
  ) {
    setIsEditDialogOpen(false);

    setSelectedSession(null);

    updateAttendanceMutation.mutate(
      {
        attendanceRecordId,
        status,
      },
      {
        onSuccess: () => {
          toast.success("Attendance updated successfully");
        },

        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update attendance",
          );
        },
      },
    );
  }

  const hasSelection = !!appliedFilters.batchId && !!appliedFilters.userId;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <StudentReportFilters
          batches={batches}
          students={students}
          batchId={batchId}
          userId={userId}
          period={period}
          selectedMonth={selectedMonth}
          startDate={startDate}
          endDate={endDate}
          isLoading={isLoading}
          isBatchesLoading={isBatchesLoading}
          isStudentsLoading={isStudentsLoading}
          onBatchChange={handleBatchChange}
          onUserChange={setUserId}
          onPeriodChange={setPeriod}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApply}
        />

        <div className="h-full">
          {hasSelection && report && !isLoading && !isFetching && (
            <StudentReportSummary summary={report.summary} />
          )}
        </div>
      </div>

      {hasSelection && (isLoading || isFetching) && (
        <div className="flex min-h-60 items-center justify-center">
          <Loader className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {hasSelection && !isLoading && !isFetching && (isError || !report) && (
        <AttendanceEmptyState
          title="No Report Found"
          description="No attendance data was found for the selected student and date range."
        />
      )}

      {hasSelection && !isLoading && !isFetching && report && (
        <>
          <StudentReportSessionList
            sessions={report.sessions}
            onEdit={handleEdit}
          />

          <EditAttendanceDialog
            open={isEditDialogOpen}
            session={selectedSession}
            isPending={updateAttendanceMutation.isPending}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleUpdateAttendance}
          />

          {report.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>

              <p className="text-muted-foreground text-sm">
                Page {page} of {report.totalPages}
              </p>

              <Button
                variant="outline"
                disabled={page >= report.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
