"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AttendanceFilters } from "./attendance-filters";
import { AttendanceSkeleton } from "./attendance-skeleton";
import { AttendanceErrorState } from "./attendance-error-state";
import { AttendanceSummaryCard } from "./attendance-summary-card";
import { BatchAttendanceCalendar } from "./batch-attendance-calendar";

type AttendanceResponse = {
  attendance_percentage: number;
  present_count: number;
  absent_count: number;
  total_classes: number;
  daily_records: {
    date: string;
    status: "present" | "absent";
  }[];
};

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

async function fetchAttendance(
  batchId: string,
  month: string,
  year: string,
): Promise<AttendanceResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("month", month);
  searchParams.set("year", year);

  const response = await fetch(
    `/api/student/batches/${batchId}/attendance?${searchParams.toString()}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load attendance");
  }

  return response.json();
}

type Props = {
  batchId: string;
};

export function BatchAttendancePanel({ batchId }: Props) {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    String(today.getMonth() + 1),
  );
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const years = Array.from({ length: 6 }, (_, index) =>
    String(today.getFullYear() - 3 + index),
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["student-attendance", batchId, selectedMonth, selectedYear],
    queryFn: () => fetchAttendance(batchId, selectedMonth, selectedYear),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <AttendanceFilters
        months={MONTHS}
        years={years}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      {error instanceof Error ? (
        <AttendanceErrorState
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <>
          {/* Top Summary Card handles its own skeleton swap */}
          {isLoading || !data ? (
            <AttendanceSkeleton />
          ) : (
            <AttendanceSummaryCard
              key={`${selectedMonth}-${selectedYear}`}
              attendancePercentage={data.attendance_percentage}
              presentCount={data.present_count}
              absentCount={data.absent_count}
              totalClasses={data.total_classes}
            />
          )}

          {/* Calendar is ALWAYS mounted, handles internal loading internally */}
          <BatchAttendanceCalendar
            month={Number(selectedMonth)}
            year={Number(selectedYear)}
            records={data?.daily_records || []}
            isLoading={isLoading || !data}
            isFetching={isFetching}
          />
        </>
      )}
    </div>
  );
}
