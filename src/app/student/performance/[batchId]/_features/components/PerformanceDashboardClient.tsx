"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Target,
  Trophy,
  Info,
  Percent,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Legend,
  Label,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { SectionError } from "@/src/components/system/SectionError";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import DottedBackground from "@/src/components/dotted-background";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import { CountUpNumber } from "@/src/app/student/tests/results/[attemptId]/_features/components/count-up-number";

// --- Data Types ---
type TestHistoryRow = {
  id: string;
  testName: string;
  testDate: string;
  evaluatedAt: string;
  studentScore: number;
  totalMarks: number;
  percentile: number;
  rank: number;
  isTopper: boolean;
  classAverage: number;
  classHighest: number;
  studentPercentage: number;
  classAvgPercentage: number;
  classHighestPercentage: number;
  uniqueChartKey?: string;
};

type AttendanceHistoryRow = {
  month: string;
  total: number;
  present: number;
  absent: number;
};

interface PerformanceData {
  metrics: {
    totalTestsAttempted: number;
    averagePercentile: number;
    averagePercentage: number;
    questionBreakdown: {
      correct: number;
      wrong: number;
      unanswered: number;
      partiallyCorrect: number;
    };
  };
  testHistory: TestHistoryRow[];
  attendance: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
  };
  attendanceHistory: AttendanceHistoryRow[];
}

// --- Strict Recharts Types ---
interface RechartsLineTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TestHistoryRow }>;
  label?: string;
  isMobile?: boolean;
}

interface RechartsBarTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: AttendanceHistoryRow }>;
  label?: string;
}

interface RechartsDonutTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { fill: string; name: string; value: number };
  }>;
}

interface CustomXAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  data: TestHistoryRow[];
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: TestHistoryRow;
}

// --- Premium Color Palette ---
const COLORS = {
  student: "#2563eb", // Royal Blue
  average: "#94a3b8", // Slate
  topper: "#d97706", // Amber
  present: "#3b82f6", // Blue
  absent: "#e11d48", // Rose
  correct: "#10b981", // Emerald
  wrong: "#e11d48", // Rose
  unanswered: "#94a3b8", // Slate
  partial: "#f59e0b", // Amber
};

/**
 * Simple mobile breakpoint detector
 */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

// --- Custom X-Axis Tick with Shadcn Tooltip ---
const CustomXAxisTick = ({
  x = 0,
  y = 0,
  payload,
  data,
}: CustomXAxisTickProps) => {
  if (!payload) return null;

  const test = data.find((d) => d.uniqueChartKey === payload.value);
  const name = test?.testName || "";
  const shortName = name.length > 12 ? name.substring(0, 12) + "..." : name;
  const date = test?.testDate || "";

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-50} y={0} width={100} height={50}>
        <div className="flex h-full w-full flex-col items-center justify-start pt-2 text-center">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-default flex-col items-center">
                  <span className="block w-full truncate text-[11px] font-medium text-muted-foreground">
                    {shortName}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground opacity-80">
                    {date}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="z-50 text-xs">
                <p className="font-bold">{name}</p>
                <p className="text-muted-foreground">{date}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </foreignObject>
    </g>
  );
};

// --- Custom Graph Dots (Strictly Sky Blue) ---
const CustomStudentDot = ({ cx = 0, cy = 0, payload }: CustomDotProps) => {
  if (!payload) return null;

  if (payload.isTopper) {
    return (
      <g transform={`translate(${cx},${cy})`}>
        {/* Subtle Sky glow - unbroken line style */}
        <circle cx={0} cy={0} r={10} fill={COLORS.student} opacity={0.3} />
        <circle
          cx={0}
          cy={0}
          r={5}
          fill={COLORS.student}
          stroke="var(--background)"
          strokeWidth={2}
        />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={COLORS.student}
      stroke="var(--background)"
      strokeWidth={2}
    />
  );
};

const CustomActiveStudentDot = ({
  cx = 0,
  cy = 0,
  payload,
}: CustomDotProps) => {
  if (!payload) return null;

  if (payload.isTopper) {
    return (
      <g transform={`translate(${cx},${cy})`}>
        <circle cx={0} cy={0} r={14} fill={COLORS.student} opacity={0.4} />
        <circle
          cx={0}
          cy={0}
          r={6}
          fill={COLORS.student}
          stroke="var(--background)"
          strokeWidth={2}
        />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={COLORS.student}
      stroke="var(--background)"
      strokeWidth={2}
    />
  );
};

// --- Custom Tooltips ---
const CustomLineTooltip = ({
  active,
  payload,
  isMobile,
}: RechartsLineTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;

    let percentileWording = `You scored equal to or higher than ${data.percentile.toFixed(2)}% of the class.`;
    if (data.isTopper) {
      percentileWording =
        "You achieved the highest score in the batch. Outstanding work!";
    } else if (data.percentile < 30) {
      percentileWording = `You scored higher than ${data.percentile.toFixed(2)}% of the class. Consider reviewing this topic.`;
    }

    return (
      <div
        className={`rounded-xl border ${data.isTopper ? "border-amber-500/40 shadow-amber-500/10" : "border-border"} bg-background/95 shadow-xl backdrop-blur-md ${
          isMobile ? "max-w-[200px] p-3" : "max-w-[240px] p-4"
        }`}
      >
        <div
          className={`border-b ${data.isTopper ? "border-amber-500/20" : "border-border/50"} ${isMobile ? "mb-2 pb-2" : "mb-3 pb-3"}`}
        >
          {data.isTopper && (
            <div className="mb-1.5 flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
              <Trophy className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                You were the Batch Topper!
              </span>
            </div>
          )}
          <p
            className={`block w-full truncate text-sm font-bold leading-tight tracking-tight ${data.isTopper ? "text-amber-600 dark:text-amber-500" : "text-foreground"}`}
          >
            {data.testName}
          </p>
          <p className="mt-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
            Evaluated on {data.testDate}
          </p>
        </div>

        <div
          className={`space-y-2 font-medium ${isMobile ? "text-xs" : "text-sm"}`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-500">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 sm:h-2 sm:w-2" />{" "}
              Your Score
            </span>
            <span className="font-bold">
              {data.studentScore.toFixed(0)} / {data.totalMarks}{" "}
              <span className="font-normal text-muted-foreground">
                ({data.studentPercentage.toFixed(0)}%)
              </span>
            </span>
          </div>

          {!data.isTopper && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 sm:h-2 sm:w-2" />{" "}
                Topper
              </span>
              <span>
                {data.classHighest.toFixed(0)} / {data.totalMarks}{" "}
                <span className="font-normal text-muted-foreground">
                  ({data.classHighestPercentage.toFixed(0)}%)
                </span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 sm:h-2 sm:w-2" />{" "}
              Class Avg
            </span>
            <span>
              {data.classAverage.toFixed(0)} / {data.totalMarks}{" "}
              <span className="font-normal text-muted-foreground">
                ({data.classAvgPercentage.toFixed(0)}%)
              </span>
            </span>
          </div>
        </div>

        <div
          className={`${isMobile ? "-mx-3 -mb-3 mt-3 px-3 pb-3 pt-3" : "-mx-4 -mb-4 mt-5 px-4 pb-4 pt-4"} rounded-b-xl border-t border-border/50 bg-muted/30`}
        >
          <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-muted-foreground">
              Rank Percentile
            </span>
            <span className="font-bold text-foreground sm:text-base">
              {data.percentile.toFixed(2)} %
            </span>
          </div>
          <p
            className={`${isMobile ? "text-[9px]" : "text-[11px]"} leading-relaxed text-muted-foreground`}
          >
            {percentileWording}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }: RechartsBarTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="min-w-[200px] rounded-xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-md">
        <p className="mb-3 border-b border-border/50 pb-2 font-bold text-foreground">
          {data.month} Overview
        </p>
        <div className="space-y-2.5 text-sm">
          <p className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">
              Classes Held
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 font-semibold">
              {data.total}
            </span>
          </p>
          <p className="flex items-center justify-between pt-1 font-medium text-blue-600 dark:text-blue-500">
            <span>Attended</span>
            <span>{data.present}</span>
          </p>
          <p className="flex items-center justify-between font-medium text-rose-600 dark:text-rose-500">
            <span>Missed</span>
            <span>{data.absent}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomDonutTooltip = ({ active, payload }: RechartsDonutTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <div className="flex min-w-[160px] items-center gap-3 rounded-lg border border-border bg-background/95 px-4 py-3 text-sm shadow-xl backdrop-blur-md">
        <span
          className="h-3 w-3 rounded-full shadow-sm"
          style={{ backgroundColor: data.payload.fill }}
        />
        <span className="font-medium text-foreground">{data.name}</span>
        <span className="ml-auto font-bold">{data.value} Qs</span>
      </div>
    );
  }
  return null;
};

export function PerformanceDashboardClient() {
  const { batchId } = useParams<{ batchId: string }>();
  const isMobile = useIsMobile();

  const [fitToScreen, setFitToScreen] = useState(false);

  const { data, isLoading, isError, error } = useQuery<PerformanceData>({
    queryKey: ["batch-performance", batchId],
    queryFn: async () => {
      const res = await fetch(`/api/student/batches/${batchId}/performance`);
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

  if (isError || !data)
    return (
      <div className="p-10">
        <SectionError
          title="Couldn't load performance"
          message={error?.message || "Please try again later."}
        />
      </div>
    );

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

  const minChartWidth = Math.max(700, chartSafeHistory.length * 120);

  return (
    <div className="space-y-8 p-2 sm:p-8 [&_:focus]:outline-none">
      {/* Header */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="relative overflow-hidden py-2 gap-3">
          <DottedBackground />
          <CardGlow color="cyan" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
                Avg. Score
              </CardTitle>
              <RichPopover
                color="cyan"
                badgeText="Score"
                title="Average Percentage"
                description="This is the raw average of marks you scored across all tests in this batch. It reflects your direct mastery of the material."
                trigger={
                  <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                }
              />
            </div>
            <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
              <Percent className="h-3.5 w-3.5 shrink-0 text-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold sm:text-xl">
              <CountUpNumber
                start
                value={Number(data.metrics.averagePercentage.toFixed(2))}
              />{" "}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden py-2 gap-3">
          <DottedBackground />
          <CardGlow color="yellow" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
                Avg. Percentile
              </CardTitle>
              <RichPopover
                color="yellow"
                badgeText="Ranking"
                title="Understanding Percentile"
                description="Percentile ranks you against your classmates. A percentile of 85 means you scored equal to or better than 85% of the students, regardless of how difficult the test was."
                trigger={
                  <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                }
              />
            </div>
            <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
              <Trophy className="h-3.5 w-3.5 shrink-0 text-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold sm:text-xl">
              <CountUpNumber
                start
                value={Number(data.metrics.averagePercentile.toFixed(2))}
              />{" "}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden py-2 gap-3">
          <DottedBackground />
          <CardGlow color="pink" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
                Overall Accuracy
              </CardTitle>
              <RichPopover
                color="pink"
                badgeText="Precision"
                title="Accuracy Rate"
                description="The percentage of questions you answered correctly out of all the questions you attempted. Skipping a question does not hurt your accuracy rate."
                trigger={
                  <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                }
              />
            </div>
            <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
              <Target className="h-3.5 w-3.5 shrink-0 text-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold sm:text-xl">
              <CountUpNumber start value={Number(overallAccuracy.toFixed(2))} />{" "}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden py-2 gap-3">
          <DottedBackground />
          <CardGlow color="indigo" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
                Attendance
              </CardTitle>
              <RichPopover
                color="purple"
                badgeText="Consistency"
                title="Class Attendance"
                description="The percentage of batch sessions you have attended. Consistent attendance correlates heavily with better test scores."
                trigger={
                  <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                }
              />
            </div>
            <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold sm:text-xl">
              <CountUpNumber
                start
                value={Number(attendancePercentage.toFixed(0))}
              />{" "}
              %
            </div>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {data.attendance.presentCount} / {data.attendance.totalSessions}{" "}
              sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Comparative Chart */}
      <Card className="relative overflow-hidden">
        <DottedBackground className="opacity-30" />
        <CardGlow color="sky" />
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CardTitle>Test Consistency & Performance</CardTitle>
                <RichPopover
                  color="cyan"
                  title="Reading this chart"
                  description="This chart tracks your performance test by test, comparing your score directly against the class average and the batch topper. Tap or hover over any point to see the full details."
                  trigger={
                    <Info className="h-4 w-4 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                  }
                />
              </div>
              <CardDescription>
                Your normalized test scores compared to the class average and
                top performer.
              </CardDescription>
            </div>

            <button
              onClick={() => setFitToScreen((prev) => !prev)}
              className="flex self-end shrink-0 items-center justify-center gap-1.5 rounded-md bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground sm:self-auto sm:px-2.5 sm:py-1.5"
            >
              {fitToScreen ? (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Enable Scroll</span>
                </>
              ) : (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Fit to Screen</span>
                </>
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="custom-scrollbar w-full overflow-x-auto pb-6">
            <div
              style={{
                minWidth: fitToScreen ? "100%" : `${minChartWidth}px`,
                height: "450px",
                transition: "min-width 0.3s ease",
              }}
            >
              {chartSafeHistory.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={1}
                  minHeight={1}
                >
                  <LineChart
                    data={chartSafeHistory}
                    margin={{
                      top: 20,
                      right: isMobile ? 15 : 30,
                      bottom: isMobile
                        ? fitToScreen
                          ? 0
                          : 20
                        : fitToScreen
                          ? 20
                          : 50,
                      left: isMobile ? 0 : 25,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.6}
                    />

                    <XAxis
                      dataKey="uniqueChartKey"
                      tick={
                        fitToScreen ? (
                          false
                        ) : (
                          <CustomXAxisTick data={chartSafeHistory} />
                        )
                      }
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      padding={{ left: 20, right: 20 }}
                      height={fitToScreen ? 30 : 60}
                    >
                      {!isMobile && (
                        <Label
                          value="Tests (Chronological Order)"
                          offset={fitToScreen ? 0 : -40}
                          position="insideBottom"
                          fill="var(--muted-foreground)"
                          fontSize={12}
                        />
                      )}
                    </XAxis>

                    <YAxis
                      type="number"
                      domain={[0, 100]}
                      width={isMobile ? 30 : 55}
                      tick={{
                        fontSize: isMobile ? 10 : 11,
                        fill: "var(--muted-foreground)",
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                    >
                      {!isMobile && (
                        <Label
                          value="Score Percentage"
                          angle={-90}
                          position="insideLeft"
                          style={{ textAnchor: "middle" }}
                          fill="var(--muted-foreground)"
                          fontSize={12}
                          dx={-20}
                        />
                      )}
                    </YAxis>

                    <RechartsTooltip
                      content={<CustomLineTooltip isMobile={isMobile} />}
                      cursor={{
                        stroke: "var(--border)",
                        strokeWidth: 2,
                        strokeDasharray: "4 4",
                      }}
                    />

                    <Legend
                      position="top"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: "13px",
                        fontWeight: 500,
                        paddingBottom: "20px",
                      }}
                    />

                    <Line
                      name="Topper Score"
                      type="monotone"
                      dataKey="classHighestPercentage"
                      stroke={COLORS.topper}
                      strokeWidth={2.5}
                      strokeDasharray="6 6"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: COLORS.topper,
                        stroke: "var(--background)",
                        strokeWidth: 2,
                      }}
                    />
                    <Line
                      name="Class Average"
                      type="monotone"
                      dataKey="classAvgPercentage"
                      stroke={COLORS.average}
                      strokeWidth={2.5}
                      strokeDasharray="6 6"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: COLORS.average,
                        stroke: "var(--background)",
                        strokeWidth: 2,
                      }}
                    />
                    <Line
                      name="Your Score"
                      type="monotone"
                      dataKey="studentPercentage"
                      stroke={COLORS.student}
                      strokeWidth={3}
                      dot={<CustomStudentDot />}
                      activeDot={<CustomActiveStudentDot />}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg bg-muted/10 text-sm text-muted-foreground">
                  No test data available yet.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts: Donut & Attendance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="relative overflow-hidden">
          <DottedBackground className="opacity-30" />
          <CardGlow color="green" />
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Monthly breakdown of classes attended
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] pt-4">
            {data.attendanceHistory.length > 0 ? (
              <div className="h-full w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={1}
                  minHeight={1}
                >
                  <BarChart
                    data={data.attendanceHistory}
                    margin={{
                      top: 10,
                      right: isMobile ? 4 : 10,
                      bottom: isMobile ? 15 : 30,
                      left: isMobile ? 0 : 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: isMobile ? 10 : 12,
                        fill: "var(--muted-foreground)",
                      }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    >
                      {!isMobile && (
                        <Label
                          value="Timeline (Months)"
                          offset={-20}
                          position="insideBottom"
                          fill="var(--muted-foreground)"
                          fontSize={12}
                        />
                      )}
                    </XAxis>
                    <YAxis
                      width={isMobile ? 24 : 45}
                      tick={{
                        fontSize: isMobile ? 10 : 12,
                        fill: "var(--muted-foreground)",
                      }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    >
                      {!isMobile && (
                        <Label
                          value="Classes (Count)"
                          angle={-90}
                          position="insideLeft"
                          style={{ textAnchor: "middle" }}
                          fill="var(--muted-foreground)"
                          fontSize={12}
                          dx={-10}
                        />
                      )}
                    </YAxis>
                    <RechartsTooltip
                      content={<CustomBarTooltip />}
                      cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                    />
                    <Legend
                      position="top"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: "13px",
                        fontWeight: 500,
                        paddingBottom: "20px",
                      }}
                    />
                    <Bar
                      name="Classes Attended"
                      dataKey="present"
                      stackId="a"
                      fill={COLORS.present}
                      radius={[0, 0, 4, 4]}
                      barSize={40}
                    />
                    <Bar
                      name="Classes Missed"
                      dataKey="absent"
                      stackId="a"
                      fill={COLORS.absent}
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-muted/10 text-sm text-muted-foreground">
                No attendance records found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <DottedBackground className="opacity-30" />
          <CardGlow color="indigo" />
          <CardHeader>
            <CardTitle>Question Distribution</CardTitle>
            <CardDescription>
              Aggregate accuracy breakdown across all tests
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-[340px] flex-col items-center justify-center pt-0">
            {donutData.length > 0 ? (
              <div className="relative h-[240px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={1}
                  minHeight={1}
                >
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    />
                    <RechartsTooltip content={<CustomDonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Accuracy Text */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {overallAccuracy.toFixed(1)}%
                  </span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Accuracy
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-[240px] w-full items-center justify-center rounded-lg bg-muted/10 text-sm text-muted-foreground">
                No questions attempted yet.
              </div>
            )}

            {donutData.length > 0 && (
              <div className="mt-4 flex w-full flex-wrap justify-center gap-2 px-2 text-xs">
                {donutData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5"
                  >
                    <span
                      className="h-2 w-2 rounded-full shadow-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-medium text-muted-foreground">
                      {item.name}
                    </span>
                    <span className="font-bold text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
