"use client";

import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Label,
  Rectangle,
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
import {
  AttendanceHistoryRow,
  RechartsBarTooltipProps,
} from "../types/performance.types";

const CustomBarTooltip = ({ active, payload }: RechartsBarTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const attendanceRate =
      data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;

    return (
      <div className="w-[150px] overflow-hidden rounded-lg border border-border/60 bg-background/95 backdrop-blur-2xl p-2.5 text-foreground shadow-lg">
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
              {attendanceRate}%
            </span>
            <span className="text-[9px] text-muted-foreground">Rate</span>
          </div>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span className="text-muted-foreground dark:text-zinc-300">
                Total
              </span>
            </div>
            <span className="font-semibold text-foreground dark:text-white">
              {data.total}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#6e3ff3" }}
              />
              <span className="text-muted-foreground dark:text-zinc-300">
                Attended
              </span>
            </div>
            <span className="font-semibold" style={{ color: "#6e3ff3" }}>
              {data.present}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#e255f2" }}
              />
              <span className="text-muted-foreground dark:text-zinc-300">
                Missed
              </span>
            </div>
            <span className="font-semibold" style={{ color: "#e255f2" }}>
              {data.absent}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: AttendanceHistoryRow;
}

const CustomPresentBar = (props: CustomBarProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload, fill } = props;
  const hasAbsent = payload?.absent && payload.absent > 0;

  const adjustedX = hasAbsent ? x : x + width / 2 + 1;

  return (
    <Rectangle
      {...props}
      x={adjustedX}
      y={y}
      width={width}
      height={height}
      radius={[4, 4, 0, 0]}
      fill={fill}
    />
  );
};

const CustomAbsentBar = (props: CustomBarProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload, fill } = props;
  const hasPresent = payload?.present && payload.present > 0;

  const adjustedX = hasPresent ? x : x - width / 2 - 1;

  return (
    <Rectangle
      {...props}
      x={adjustedX}
      y={y}
      width={width}
      height={height}
      radius={[4, 4, 0, 0]}
      fill={fill}
    />
  );
};

interface AttendanceBarChartProps {
  attendanceHistory: AttendanceHistoryRow[];
  isMobile: boolean;
}

export function AttendanceBarChart({
  attendanceHistory,
  isMobile,
}: AttendanceBarChartProps) {
  const { resolvedTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- UNIVERSAL GRAB & DRAG SCROLLING ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, scrollLeft: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;

    const isRotated =
      typeof window !== "undefined" &&
      isFullscreen &&
      window.innerHeight > window.innerWidth &&
      window.innerWidth < 768;

    if (e.pointerType === "touch" && !isRotated) return;
    if (e.pointerType === "mouse" && e.button !== 0) return; // Only left click

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
    const deltaY = e.clientY - startPos.y;

    const isRotated =
      typeof window !== "undefined" &&
      isFullscreen &&
      window.innerHeight > window.innerWidth &&
      window.innerWidth < 768;

    const walk = (isRotated ? deltaY : deltaX) * 1.5;
    scrollRef.current.scrollLeft = startPos.scrollLeft - walk;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#64748b";
  const gridColor = isDark ? "#27272a" : "#e2e8f0";

  // Dynamic width based on the number of months to ensure scrolling activates when there are many bars
  const minChartWidth = Math.max(600, attendanceHistory.length * 80);

  const renderChart = () => (
    <Card
      className={`relative flex flex-col overflow-hidden ${
        isFullscreen
          ? "h-full w-full rounded-none border-none shadow-none pb-2"
          : "h-[500px] w-full"
      }`}
    >
      {!isFullscreen && <DottedBackground className="opacity-30" />}
      {!isFullscreen && <CardGlow color="purple" hideLightGlow />}

      <CardHeader
        className={`shrink-0 ${
          isFullscreen ? "p-2 pb-1 sm:p-4 sm:pb-2" : "pb-2"
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className={isFullscreen ? "text-sm sm:text-base" : ""}>
              Attendance Trends
            </CardTitle>
            {!isFullscreen && (
              <CardDescription>
                Monthly breakdown of classes attended
              </CardDescription>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-end lg:gap-2 lg:self-auto">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-purple-500/10 font-medium text-purple-600 transition-colors hover:bg-purple-500/20 dark:text-purple-400 ${
                isFullscreen
                  ? "px-2 py-1.5 text-[10px]"
                  : "px-3 py-2 text-xs sm:px-2.5 sm:py-1.5"
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2
                    className={isFullscreen ? "h-3 w-3" : "h-3.5 w-3.5"}
                  />
                  <span>Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Full Screen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden px-2 pb-2 sm:px-6 sm:pb-6">
        {attendanceHistory.length > 0 ? (
          <div
            ref={scrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`custom-scrollbar flex-1 min-h-0 w-full overflow-y-hidden overflow-x-auto scrollbar-thumb-violet-600 overscroll-x-contain scrollbar-thin ${
              isDragging ? "cursor-grabbing select-none" : "cursor-grab"
            } ${isFullscreen ? "touch-none" : ""} pb-2 pt-4`}
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
              >
                <BarChart
                  data={attendanceHistory}
                  barGap={2}
                  margin={{
                    top: 10,
                    right: isMobile ? 4 : 10,
                    bottom: isMobile ? 15 : 30,
                    left: isMobile ? 0 : 10,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="presentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6e3ff3" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#6e3ff3"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                    <linearGradient
                      id="absentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#e255f2" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#e255f2"
                        stopOpacity={0.6}
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
                    cursor={{
                      fill: isDark ? "#27272a" : "#f1f5f9",
                      opacity: 0.4,
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

                  <Bar
                    name="Classes Attended"
                    dataKey="present"
                    fill="url(#presentGradient)"
                    maxBarSize={20}
                    shape={<CustomPresentBar />}
                  />
                  <Bar
                    name="Classes Missed"
                    dataKey="absent"
                    fill="url(#absentGradient)"
                    maxBarSize={20}
                    shape={<CustomAbsentBar />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 h-full items-center justify-center rounded-lg bg-muted/10 text-sm text-muted-foreground">
            No attendance records found.
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Standard In-Page Render */}
      {!isFullscreen && renderChart()}

      {/* SHADCN DIALOG FIX: Flawless scroll-lock portal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="m-0 h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-none bg-card p-0 shadow-none sm:max-w-none sm:rounded-none [&>button]:hidden ">
          <DialogTitle className="sr-only">Fullscreen Chart</DialogTitle>
          <DialogDescription className="sr-only">
            Fullscreen view of the attendance trends chart.
          </DialogDescription>

          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card max-md:portrait:top-1/2 max-md:portrait:left-1/2 max-md:portrait:h-[100dvw] max-md:portrait:w-[100dvh] max-md:portrait:-translate-x-1/2 max-md:portrait:-translate-y-1/2 max-md:portrait:rotate-90 ">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
