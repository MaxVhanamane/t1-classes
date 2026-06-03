"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { CheckCircle2, XCircle, CalendarDays, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { Skeleton } from "@/src/components/ui/skeleton";
import DottedBackground from "@/src/components/dotted-background";
import { CountUpNumber } from "@/src/app/student/tests/results/[attemptId]/_features/components/count-up-number";

type AttendanceResponse = {
  attendance_percentage: number;
  present_count: number;
  absent_count: number;
  total_classes: number;

  recent_sessions: {
    attendance_date: string;
    status: "present" | "absent";
  }[];
};

async function fetchAttendance(
  batchId: string,
  month: string,
  year: string,
): Promise<AttendanceResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("month", month);
  searchParams.set("year", year);

  const response = await fetch(
    `/api/batches/${batchId}/attendance?${searchParams.toString()}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load attendance");
  }

  return response.json();
}

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

export function BatchAttendancePanel({ batchId }: { batchId: string }) {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    String(today.getMonth() + 1),
  );

  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const years = Array.from({ length: 6 }, (_, index) =>
    String(today.getFullYear() - 3 + index),
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-attendance", batchId, selectedMonth, selectedYear],

    queryFn: () => fetchAttendance(batchId, selectedMonth, selectedYear),

    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-32 bg-muted/70" />
            <Skeleton className="h-4 w-52 bg-muted/70" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-36 bg-muted/70" />
            <Skeleton className="h-9 w-24 bg-muted/70" />
          </div>
        </div>

        {/* Attendance Hero Card */}
        <Card className="overflow-hidden border relative bg-linear-to-br from-background via-background to-muted/30 backdrop-blur">
          <DottedBackground />
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 bg-muted/70" />
              <Skeleton className="h-14 w-40 bg-muted/70" />
              <Skeleton className="h-4 w-28 bg-muted/70" />
            </div>

            <Skeleton className="mt-6 h-3 w-full rounded-full bg-muted/70" />

            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-14 bg-muted/70" />
                  <Skeleton className="h-8 w-16 bg-muted/70" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-40 bg-muted/70" />
            <Skeleton className="h-4 w-16 bg-muted/70" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="relative">
                <DottedBackground />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full bg-muted/70" />

                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28 bg-muted/70" />
                        <Skeleton className="h-3 w-20 bg-muted/70" />
                      </div>
                    </div>

                    <Skeleton className="h-6 w-20 rounded-full bg-muted/70" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center  max-w-2xl">
          <p className="text-muted-foreground text-sm">
            Failed to load attendance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const attendance = Number(data.attendance_percentage) || 0;

  const attendanceLabel =
    attendance >= 90
      ? "Excellent"
      : attendance >= 75
        ? "Good Standing"
        : attendance >= 60
          ? "Average"
          : "Needs Improvement";

  return (
    <div className="space-y-6  max-w-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Attendance</h2>

          <p className="text-muted-foreground text-sm">
            Track your monthly performance
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36">
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

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
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

      <Card className="relative overflow-hidden border bg-linear-to-br from-background via-background to-muted/30 backdrop-blur ">
        <DottedBackground />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Attendance Rate</p>

              <h2 className="mt-1 text-5xl font-bold tracking-tight">
                <CountUpNumber
                  start={true}
                  value={parseFloat(attendance.toFixed(1))}
                />{" "}
                %
              </h2>

              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />

                <span className="text-sm font-medium">{attendanceLabel}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted mt-6 h-3 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{
                width: `${attendance}%`,
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-3 lg:gap-6 gap-2 border-t border-border/50 pt-6">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Present
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold text-emerald-500">
                  {data.present_count}
                </span>

                <span className="text-muted-foreground mb-1 text-sm">
                  {data.present_count === 1 ? "class" : "classes"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Absent
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold text-red-500">
                  {data.absent_count}
                </span>

                <span className="text-muted-foreground mb-1 text-sm">
                  {data.absent_count === 1 ? "class" : "classes"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Total
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold">{data.total_classes}</span>

                <span className="text-muted-foreground mb-1 text-sm">
                  {data.total_classes === 1 ? "class" : "classes"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Recent Attendance</h3>

          <span className="text-muted-foreground text-sm">
            {data.recent_sessions.length}{" "}
            {data.recent_sessions.length === 1 ? "record" : "records"}
          </span>
        </div>

        {data.recent_sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <CalendarDays className="text-muted-foreground mx-auto mb-3 h-8 w-8" />

              <p className="text-muted-foreground text-sm">
                No attendance records found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.recent_sessions.map((session, index) => {
              const isPresent = session.status === "present";

              return (
                <Card
                  key={`${session.attendance_date}-${session.status}-${index}`}
                  className={`group relative overflow-hidden border border-border/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm bg-background ${
                    isPresent
                      ? "border-l-4 border-l-emerald-500"
                      : "border-l-4 border-l-red-500"
                  }`}
                >
                  <DottedBackground />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isPresent ? "bg-emerald-500/10" : "bg-red-500/10"
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">
                            {new Date(
                              session.attendance_date,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>

                          <p className="text-muted-foreground text-xs">
                            Attendance Record
                          </p>
                        </div>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isPresent
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
