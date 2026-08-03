"use client";

import { useState, useRef, useEffect } from "react";
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
import { cn } from "@/src/lib/utils";

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

  // --- NATIVE FULLSCREEN + ORIENTATION LOCK ---
  // Replaces the old CSS rotate-90 hack. That approach visually rotated the
  // chart, but touch/pointer clientX/clientY coordinates are still reported
  // in the original, un-rotated space — causing a mismatch between what you
  // see and what you can actually tap, worst near the edges. Physically
  // locking the device into landscape via the Fullscreen + Screen
  // Orientation APIs means the browser itself reports correct landscape
  // coordinates, so there's no mismatch at all.
  //
  // Support for orientation lock varies (notably unsupported on iOS Safari),
  // so this fails silently and falls back to a plain portrait fullscreen
  // dialog with horizontal drag/scroll, which still works correctly.
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

  // Keep React state in sync if the user exits fullscreen via the system
  // back button/gesture instead of our own "Exit Full Screen" button.
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

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#64748b";
  const gridColor = isDark ? "#27272a" : "#e2e8f0";

  // Dynamic width based on the number of months to ensure scrolling activates when there are many bars
  const minChartWidth = Math.max(600, attendanceHistory.length * 80);

  const renderChart = () => (
    <Card
      className={`relative gap-3 flex flex-col pb-0 overflow-hidden [&_.recharts-wrapper]:outline-none! [&_.recharts-surface]:outline-none! [&_.recharts-wrapper]:[-webkit-tap-highlight-color:transparent] [&_.recharts-surface]:[-webkit-tap-highlight-color:transparent] ${
        isFullscreen
          ? "h-full w-full rounded-none border-none shadow-none pt-4"
          : "h-[500px] w-full"
      }`}
    >
      {<DottedBackground className="opacity-30" />}
      {
        <CardGlow
          color="purple"
          hideLightGlow
          className={cn(isFullscreen && "rounded-none opacity-50")}
        />
      }

      <CardHeader className="px-3 sm:px-6">
        <div
          className={cn(
            "flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between",
            isFullscreen && "flex-row justify-between",
          )}
        >
          <div className="space-y-1.5">
            <CardTitle
              className={`truncate ${
                isFullscreen ? "text-sm sm:text-base" : ""
              }`}
            >
              <span className={isFullscreen ? "hidden sm:inline" : ""}>
                Attendance Trends
              </span>
              {isFullscreen && <span className="sm:hidden">Attendance</span>}
            </CardTitle>
            {!isFullscreen && (
              <CardDescription className="text-xs">
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
      </CardHeader>

      <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden px-3 pb-0 sm:px-6 ">
        {attendanceHistory.length > 0 ? (
          <>
            {/* NEW CUSTOM HTML LEGEND */}
            <div className="shrink-0 mb-2 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "#6e3ff3" }}
                />
                Classes Attended
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "#e255f2" }}
                />
                Classes Missed
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
              className={`custom-scrollbar focus:outline-none [-webkit-tap-highlight-color:transparent] flex-1 min-h-0 focus:outline-none w-full overflow-y-hidden overflow-x-auto scrollbar-thumb-violet-600 overscroll-x-contain scrollbar-thin ${
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
                    data={attendanceHistory}
                    barGap={2}
                    margin={{
                      top: 10, // Keeps maximum vertical breathing room
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

                    {/* THE RECHARTS <Legend /> HAS BEEN REMOVED FROM HERE */}

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
          </>
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

      {/* Fullscreen dialog portal — landscape orientation is requested
          natively (see the useEffect above) rather than faked with CSS
          rotation, so touch hit-testing lines up correctly with what's
          rendered on screen. */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="m-0 h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-none bg-card p-0 shadow-none outline-none focus:outline-none focus-visible:outline-none sm:max-w-none  [&>button]:hidden ">
          <DialogTitle className="sr-only">Fullscreen Chart</DialogTitle>
          <DialogDescription className="sr-only">
            Fullscreen view of the attendance trends chart.
          </DialogDescription>

          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
