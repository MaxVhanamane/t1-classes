"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Maximize2, Minimize2, CheckSquare, BookX } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import DottedBackground from "@/src/components/dotted-background";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { HomeworkHistoryRow } from "../types/performance.types";
import { cn } from "@/src/lib/utils";
import { EmptyState } from "./empty-state";

// --- STRICT TYPING (NO ANY) ---
export interface RechartsHomeworkTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      month: string;
      completed: number;
      missed: number;
      total: number;
    };
  }>;
  label?: string;
}

interface HomeworkTrendsChartProps {
  homeworkHistory: HomeworkHistoryRow[];
  isMobile: boolean;
}

const CustomBarTooltip = ({
  active,
  payload,
}: RechartsHomeworkTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const completionRate =
      data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

    return (
      <div className="w-[160px] overflow-hidden rounded-lg border border-border/60 bg-background/95 backdrop-blur-2xl p-2.5 text-foreground shadow-lg">
        <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-1.5 dark:border-zinc-800/80">
          <div>
            <h4 className="font-medium tracking-wide text-foreground dark:text-white text-xs">
              {data.month}
            </h4>
            <span className="text-[9px] text-muted-foreground uppercase">
              Monthly
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </span>
            <span className="text-[9px] text-muted-foreground">Done</span>
          </div>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span className="text-muted-foreground dark:text-zinc-300">
                Assigned
              </span>
            </div>
            <span className="font-semibold text-foreground dark:text-white">
              {data.total}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                style={{ background: "#10b981" }}
              />
              <span className="text-muted-foreground dark:text-zinc-300">
                Completed
              </span>
            </div>
            <span className="font-semibold" style={{ color: "#10b981" }}>
              {data.completed}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full shadow-[0_0_4px_rgba(244,63,94,0.5)]"
                style={{ background: "#f43f5e" }}
              />
              <span className="text-muted-foreground dark:text-zinc-300">
                Missed
              </span>
            </div>
            <span className="font-semibold" style={{ color: "#f43f5e" }}>
              {data.missed}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function HomeworkTrendsChart({
  homeworkHistory,
  isMobile,
}: HomeworkTrendsChartProps) {
  const { resolvedTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Overall");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, scrollLeft: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setIsDragging(true);
    setStartPos({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scrollRef.current.scrollLeft,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    const deltaX = e.clientX - startPos.x;
    const walk = deltaX * 1.5;
    scrollRef.current.scrollLeft = startPos.scrollLeft - walk;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    if (!isFullscreen) return;

    const lockLandscape = async () => {
      try {
        const isNarrowMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        if (!isNarrowMobile) return;

        if (
          document.documentElement.requestFullscreen &&
          !document.fullscreenElement
        ) {
          await document.documentElement.requestFullscreen();
        }
        const orientation = screen.orientation as
          | (ScreenOrientation & { lock?: (o: string) => Promise<void> })
          | undefined;
        if (orientation?.lock) {
          await orientation.lock("landscape");
        }
      } catch {
        // Not supported on this browser/device — ignore and fall back to
        // the plain (non-rotated) portrait fullscreen dialog.
      }
    };

    void lockLandscape();

    return () => {
      try {
        const orientation = screen.orientation as
          | (ScreenOrientation & { unlock?: () => void })
          | undefined;
        orientation?.unlock?.();
      } catch {
        // ignore
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isFullscreen]);
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  // Extract unique subjects for the tabs
  const subjects = useMemo(() => {
    const unique = new Set(homeworkHistory.map((h) => h.subject.toLowerCase()));
    return ["Overall", ...Array.from(unique)];
  }, [homeworkHistory]);

  // Process data based on selected tab
  const processedData = useMemo(() => {
    const grouped = new Map<
      string,
      { month: string; completed: number; missed: number; total: number }
    >();

    homeworkHistory.forEach((row) => {
      if (
        selectedSubject !== "Overall" &&
        row.subject.toLowerCase() !== selectedSubject.toLowerCase()
      ) {
        return;
      }

      const existing = grouped.get(row.month) || {
        month: row.month,
        completed: 0,
        missed: 0,
        total: 0,
      };
      existing.completed += row.completed;
      existing.missed += row.missed;
      existing.total += row.total;
      grouped.set(row.month, existing);
    });

    return Array.from(grouped.values());
  }, [homeworkHistory, selectedSubject]);

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#64748b";
  const gridColor = isDark ? "#27272a" : "#e2e8f0";

  const minChartWidth = Math.max(600, processedData.length * 80);

  const renderChart = () => (
    <Card
      className={`relative gap-3 flex flex-col pb-0 overflow-hidden [&_.recharts-wrapper]:outline-none! [&_.recharts-surface]:outline-none! [&_.recharts-wrapper]:[-webkit-tap-highlight-color:transparent] [&_.recharts-surface]:[-webkit-tap-highlight-color:transparent] ${
        isFullscreen
          ? "h-full w-full rounded-none border-none shadow-none pt-4"
          : "h-[500px] w-full"
      }`}
    >
      <DottedBackground className="opacity-30" />
      <CardGlow
        color="emerald"
        hideLightGlow
        className={cn(isFullscreen && "rounded-none opacity-50")}
      />

      <CardHeader className="px-3 sm:px-6 pb-2">
        <div
          className={cn(
            "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
            isFullscreen && "flex-row justify-between",
          )}
        >
          <div className="space-y-1.5 min-w-0">
            <CardTitle
              className={`flex items-center gap-2 truncate ${
                isFullscreen ? "text-sm sm:text-base" : ""
              }`}
            >
              <CheckSquare className="h-4 w-4 text-emerald-500" />
              <span className={isFullscreen ? "hidden sm:inline" : ""}>
                Homework Progress
              </span>
              {isFullscreen && <span className="sm:hidden">Homework</span>}
            </CardTitle>
            {!isFullscreen && (
              <CardDescription className="text-xs truncate">
                Monthly completion rates across assignments
              </CardDescription>
            )}
          </div>

          <div className="flex shrink-0 items-center self-end lg:self-auto">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-emerald-500/10 font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-500 ${
                isFullscreen
                  ? "px-2 py-1.5 text-[10px]"
                  : "px-3 py-1.5 text-xs sm:px-2.5 sm:py-1.5"
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3 w-3" />
                  <span>Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3" />
                  <span>Full Screen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {subjects.length > 1 && (
          <div className="mt-2 flex w-full overflow-x-auto no-scrollbar pb-1">
            <LayoutGroup>
              <div className="flex gap-1.5 rounded-lg border border-border/50 bg-secondary/40 dark:bg-zinc-900/50 p-1">
                {subjects.map((subject) => {
                  const isActive =
                    selectedSubject.toLowerCase() === subject.toLowerCase();
                  return (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className="relative rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="hw-subject-tab"
                          className="absolute inset-0 rounded-md bg-background dark:bg-zinc-800 shadow-sm border border-border/50 dark:border-zinc-700"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 capitalize transition-colors",
                          isActive
                            ? "text-foreground dark:text-zinc-100"
                            : "text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-200",
                        )}
                      >
                        {subject}
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden px-3 pb-0 sm:px-6">
        {processedData.length > 0 ? (
          <>
            <div className="shrink-0 mb-3 flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-y-2 px-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Viewing:{" "}
                <span className="text-foreground capitalize">
                  {selectedSubject}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  Completed
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  Missed
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              tabIndex={-1}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`custom-scrollbar focus:outline-none [-webkit-tap-highlight-color:transparent] flex-1 min-h-0 w-full overflow-y-hidden overflow-x-auto scrollbar-thumb-emerald-600 overscroll-x-contain scrollbar-thin ${
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              } ${isFullscreen ? "touch-none" : ""} pb-2 pt-2`}
            >
              <div
                className="h-full"
                style={{
                  width: "100%",
                  minWidth: `max(100%, ${minChartWidth}px)`,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  className={isDragging ? "pointer-events-none" : ""}
                  style={{ outline: "none" }}
                >
                  <BarChart
                    accessibilityLayer={false}
                    style={{ outline: "none" }}
                    data={processedData}
                    barGap={0}
                    margin={{
                      top: 10,
                      right: isMobile ? 4 : 10,
                      bottom: isMobile ? 15 : 30,
                      left: isMobile ? 0 : 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="completedGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#059669"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                      <linearGradient
                        id="missedGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#e11d48"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridColor}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      tickMargin={12}
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
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      dx={-5}
                      allowDecimals={false}
                    >
                      {!isMobile && (
                        <Label
                          value="Assignments"
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
                      cursor={{
                        fill: isDark ? "#27272a" : "#f1f5f9",
                        opacity: 0.4,
                      }}
                    />

                    {/* Stacked Bars! */}
                    <Bar
                      dataKey="completed"
                      stackId="a"
                      fill="url(#completedGrad)"
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey="missed"
                      stackId="a"
                      fill="url(#missedGrad)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No homework records found"
            description="When homework assignments are published and graded, the performance trends will appear here."
            icon={<BookX className="h-5 w-5 text-muted-foreground/70" />}
          />
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {!isFullscreen && renderChart()}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="m-0 h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-none bg-card p-0 shadow-none outline-none focus:outline-none focus-visible:outline-none sm:max-w-none [&>button]:hidden">
          <DialogTitle className="sr-only">Fullscreen Chart</DialogTitle>
          <DialogDescription className="sr-only">
            Fullscreen view of homework trends.
          </DialogDescription>
          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
