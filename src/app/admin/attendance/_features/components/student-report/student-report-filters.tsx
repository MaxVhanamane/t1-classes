"use client";

import { Loader } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Toggle } from "@/src/components/ui/toggle";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { AttendanceBatchOption } from "../../types/attendance";

type StudentOption = {
  user_id: string;

  full_name: string;

  roll_number: number;
};

type StudentReportFiltersProps = {
  batches: AttendanceBatchOption[];

  students: StudentOption[];

  batchId?: string;

  userId?: string;

  period: "today" | "month" | "custom";

  selectedMonth: string;

  selectedYear: string;

  startDate?: string;

  endDate?: string;

  isLoading: boolean;

  isBatchesLoading: boolean;

  isStudentsLoading: boolean;

  onBatchChange: (value: string) => void;

  onUserChange: (value: string) => void;

  onPeriodChange: (value: "today" | "month" | "custom") => void;

  onMonthChange: (value: string) => void;

  onYearChange: (value: string) => void;

  onStartDateChange: (value: string) => void;

  onEndDateChange: (value: string) => void;

  onApply: () => void;
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

export function StudentReportFilters({
  batches,
  students,
  batchId,
  userId,
  period,
  selectedMonth,
  selectedYear,
  startDate,
  endDate,
  isLoading,
  isBatchesLoading,
  isStudentsLoading,
  onBatchChange,
  onUserChange,
  onPeriodChange,
  onMonthChange,
  onYearChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: StudentReportFiltersProps) {
  const isInvalidDateRange = Boolean(
    period === "custom" && startDate && endDate && startDate > endDate,
  );

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 6 }, (_, index) =>
    String(currentYear - 3 + index),
  );

  return (
    <Card className="max-w-5xl border-border/60 py-4">
      <CardContent className="space-y-5 p-4 ">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Batch</label>

            <Select value={batchId ?? ""} onValueChange={onBatchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />

                {isBatchesLoading && (
                  <Loader className="ml-auto h-4 w-4 animate-spin" />
                )}
              </SelectTrigger>

              <SelectContent>
                {isBatchesLoading ? (
                  <SelectItem value="loading-batches" disabled>
                    Loading batches...
                  </SelectItem>
                ) : batches.length === 0 ? (
                  <SelectItem value="no-batches" disabled>
                    No batches found
                  </SelectItem>
                ) : (
                  batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Student</label>

            <Select
              value={userId ?? ""}
              onValueChange={onUserChange}
              disabled={!batchId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    batchId ? "Select student" : "Select batch first"
                  }
                />

                {isStudentsLoading && (
                  <Loader className="ml-auto h-4 w-4 animate-spin" />
                )}
              </SelectTrigger>

              <SelectContent>
                {!batchId ? (
                  <SelectItem value="select-batch-first" disabled>
                    Select batch first
                  </SelectItem>
                ) : isStudentsLoading ? (
                  <SelectItem value="loading-students" disabled>
                    Loading students...
                  </SelectItem>
                ) : students.length === 0 ? (
                  <SelectItem value="no-students" disabled>
                    No students found
                  </SelectItem>
                ) : (
                  students.map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.roll_number}
                      {" • "}
                      {student.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Period</label>

          <div className="flex flex-wrap gap-2">
            <Toggle
              pressed={period === "today"}
              onPressedChange={() => onPeriodChange("today")}
              variant="outline"
              className="px-4"
            >
              Today
            </Toggle>

            <Toggle
              pressed={period === "month"}
              onPressedChange={() => onPeriodChange("month")}
              variant="outline"
              className="px-4"
            >
              Month
            </Toggle>

            <Toggle
              pressed={period === "custom"}
              onPressedChange={() => onPeriodChange("custom")}
              variant="outline"
              className="px-4"
            >
              Custom Range
            </Toggle>
          </div>
        </div>

        {period === "month" && (
          <div>
            <label className="mb-2 block text-sm font-medium">Month</label>

            <div className="flex gap-3">
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {period === "custom" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                From Date
              </label>

              <Input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">To Date</label>

              <Input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>

            {isInvalidDateRange && (
              <p className="text-destructive text-sm md:col-span-2">
                End date must be on or after the start date.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={onApply}
            disabled={!batchId || !userId || isLoading || isInvalidDateRange}
            className="min-w-38"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "View Report"
            )}
          </Button>
        </div>
        <div className="flex items-center justify-center h-3 ">
          {!batchId && (
            <p className="text-muted-foreground text-xs">
              Select a batch and student to view attendance reports.
            </p>
          )}

          {batchId && !userId && (
            <p className="text-muted-foreground text-xs">
              Select a student to continue.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
