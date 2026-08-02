"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { SectionError } from "@/src/components/system/SectionError";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

import { KpiCards } from "./kpi-cards";
import { PerformanceLineChart } from "./performance-line-chart";

import { QuestionDonutChart } from "./question-donut-chart";
import { useIsMobile } from "../hooks/use-is-mobile";
import { PerformanceData } from "../types/performance.types";
import { COLORS } from "../constants/performance.constants";
import { AttendanceBarChart } from "./attendance-bar-chart";
import { PerformanceBySubjectChart } from "./performance-by-subject-chart";
import { SubjectGrowthTrendlineChart } from "./subject-growth-trendline-chart";

export function PerformanceDashboardClient() {
  const { batchId, studentId } = useParams<{
    batchId: string;
    studentId?: string;
  }>();
  const isMobile = useIsMobile();

  const { data, isLoading, isError, error } = useQuery<PerformanceData>({
    queryKey: ["batch-performance", batchId, studentId],
    queryFn: async () => {
      const fetchUrl = studentId
        ? `/api/admin/batches/${batchId}/students/${studentId}/performance`
        : `/api/student/batches/${batchId}/performance`;

      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch performance data");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full justify-center p-4 pt-24 sm:p-8 sm:pt-32">
        <LoadingIndicator message="Fetching performance analytics..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-10">
        <SectionError
          title="Couldn't load performance"
          message={error?.message || "Please try again later."}
        />
      </div>
    );
  }

  const chartSafeHistory = data.testHistory.map((test, index) => ({
    ...test,
    uniqueChartKey: `${test.id}-${index}`,
    studentPercentage: Number(test.studentPercentage) || 0,
    classAvgPercentage: Number(test.classAvgPercentage) || 0,
    classHighestPercentage: Number(test.classHighestPercentage) || 0,
    isTopper: Boolean(test.isTopper),
    rank: Number(test.rank) || 0,
  }));

  const attendancePercentage =
    data.attendance.totalSessions > 0
      ? (data.attendance.presentCount / data.attendance.totalSessions) * 100
      : 0;

  const totalQuestions =
    data.metrics.questionBreakdown.correct +
    data.metrics.questionBreakdown.wrong +
    data.metrics.questionBreakdown.unanswered +
    data.metrics.questionBreakdown.partiallyCorrect;

  const overallAccuracy =
    totalQuestions > 0
      ? (data.metrics.questionBreakdown.correct / totalQuestions) * 100
      : 0;

  const donutData = [
    {
      name: "Correct",
      value: data.metrics.questionBreakdown.correct,
      fill: COLORS.correct,
    },
    {
      name: "Wrong",
      value: data.metrics.questionBreakdown.wrong,
      fill: COLORS.wrong,
    },
    {
      name: "Unanswered",
      value: data.metrics.questionBreakdown.unanswered,
      fill: COLORS.unanswered,
    },
    {
      name: "Partial",
      value: data.metrics.questionBreakdown.partiallyCorrect,
      fill: COLORS.partial,
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 p-2 sm:p-8 [&_:focus]:outline-none">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive breakdown of your test and class history.
          </p>
        </div>
      </div>

      <KpiCards
        averagePercentage={data.metrics.averagePercentage}
        averagePercentile={data.metrics.averagePercentile}
        overallAccuracy={overallAccuracy}
        attendancePercentage={attendancePercentage}
        presentCount={data.attendance.presentCount}
        totalSessions={data.attendance.totalSessions}
      />

      <PerformanceLineChart
        chartSafeHistory={chartSafeHistory}
        isMobile={isMobile}
      />

      <SubjectGrowthTrendlineChart
        subjectGrowthTrends={data.subjectGrowthTrends}
        isMobile={isMobile}
      />

      <PerformanceBySubjectChart
        performanceBySubject={data.performanceBySubject}
        isMobile={isMobile}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceBarChart
          attendanceHistory={data.attendanceHistory}
          isMobile={isMobile}
        />

        <QuestionDonutChart
          donutData={donutData}
          overallAccuracy={overallAccuracy}
        />
      </div>
    </div>
  );
}
