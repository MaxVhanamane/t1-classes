"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Info,
  Maximize2,
  Minimize2,
  Trophy,
  Scaling,
  ArrowRightLeft,
} from "lucide-react";
import {
  LineChart,
  Line,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import DottedBackground from "@/src/components/dotted-background";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import {
  TestHistoryRow,
  CustomXAxisTickProps,
  CustomDotProps,
  RechartsLineTooltipProps,
} from "../types/performance.types";
import { COLORS } from "../constants/performance.constants";
import { cn } from "@/src/lib/utils";
import { EmptyState } from "./empty-state";

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
    <motion.g
      transform={`translate(${x},${y})`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
    >
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
              <TooltipContent side="bottom" className="z-[110] text-xs">
                <p className="font-bold">{name}</p>
                <p className="text-muted-foreground">{date}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </foreignObject>
    </motion.g>
  );
};

const CustomStudentDot = ({ cx = 0, cy = 0, payload }: CustomDotProps) => {
  if (!payload) return null;
  if (payload.isTopper) {
    return (
      <g transform={`translate(${cx},${cy})`}>
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
        className={`rounded-xl border ${
          data.isTopper
            ? "border-amber-500/40 shadow-amber-500/10"
            : "border-border"
        } bg-background/95 shadow-md backdrop-blur-md overflow-hidden ${
          isMobile ? "max-w-[210px] p-2.5" : "max-w-[235px] p-3"
        }`}
      >
        {data.isTopper && <CardGlow color="amber" />}

        {/* Header */}
        <div
          className={`border-b ${
            data.isTopper ? "border-amber-500/20" : "border-border/50"
          } pb-1.5 mb-1.5`}
        >
          {data.isTopper && (
            <div className="mb-0.5 flex items-center gap-1 text-amber-600 dark:text-amber-500">
              <Trophy className="h-3 w-3 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                You were the Batch Topper!
              </span>
            </div>
          )}
          <p
            className={`block w-full truncate text-xs font-bold leading-tight ${
              data.isTopper
                ? "text-amber-600 dark:text-amber-500"
                : "text-foreground"
            }`}
          >
            {data.testName}
          </p>
          <p className="mt-0.5 text-[9px] font-medium text-muted-foreground">
            Evaluated on {data.testDate}
          </p>
        </div>

        {/* Metrics List */}
        <div className="space-y-1 text-[11px] font-medium leading-snug">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-500">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Your Score
            </span>
            <span className="font-bold">
              {data.studentScore.toFixed(0)}/{data.totalMarks}{" "}
              <span className="font-normal text-muted-foreground text-[10px]">
                ({data.studentPercentage.toFixed(1)}%)
              </span>
            </span>
          </div>

          {!data.isTopper && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Topper
              </span>
              <span>
                {data.classHighest.toFixed(0)}/{data.totalMarks}{" "}
                <span className="font-normal text-muted-foreground text-[10px]">
                  ({data.classHighestPercentage.toFixed(1)}%)
                </span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Class Avg
            </span>
            <span>
              {data.classAverage.toFixed(1)}/{data.totalMarks}{" "}
              <span className="font-normal text-muted-foreground text-[10px]">
                ({data.classAvgPercentage.toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>

        {/* Footer: Percentile & Wording */}
        <div className="mt-2 pt-1.5 border-t border-border/50">
          <div className="flex items-center justify-between text-[11px] mb-0.5">
            <span className="font-medium text-muted-foreground">
              Rank Percentile
            </span>
            <span className="font-bold text-foreground">
              {data.percentile.toFixed(1)}%
            </span>
          </div>
          <p className="text-[9px] leading-tight text-muted-foreground">
            {percentileWording}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface PerformanceLineChartProps {
  chartSafeHistory: TestHistoryRow[];
  isMobile: boolean;
}

export function PerformanceLineChart({
  chartSafeHistory,
  isMobile,
}: PerformanceLineChartProps) {
  const [fitToScreen, setFitToScreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const minChartWidth = Math.max(700, chartSafeHistory.length * 120);

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
  // see and what you can actually tap, worst near the edges (the first
  // couple of points). Physically locking the device into landscape via the
  // Fullscreen + Screen Orientation APIs means the browser itself reports
  // correct landscape coordinates, so there's no mismatch at all.
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

  // NOTE: Card carries the real fixed height (h-[450px] normally, h-full in
  // fullscreen) exactly like the working SubjectGrowthTrendlineChart. Without
  // this, CardContent's flex-1/min-h-0 has nothing to resolve against and
  // ResponsiveContainer collapses to 0 height — that was the bug.
  const renderChart = () => (
    <Card
      className={`relative gap-3 flex flex-col pb-0 overflow-hidden [&_.recharts-wrapper]:outline-none! [&_.recharts-surface]:outline-none! [&_.recharts-wrapper]:[-webkit-tap-highlight-color:transparent] [&_.recharts-surface]:[-webkit-tap-highlight-color:transparent] ${
        isFullscreen
          ? "h-full w-full rounded-none border-none shadow-none pt-4"
          : "h-[500px] lg:h-[550px] w-full"
      }`}
    >
      {<DottedBackground className="opacity-30" />}
      {
        <CardGlow
          color="sky"
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
            <div className="flex items-center gap-2 truncate">
              <CardTitle
                className={`flex items-center gap-2 ${
                  isFullscreen ? "text-sm sm:text-base" : ""
                }`}
              >
                <span className={isFullscreen ? "hidden sm:inline" : ""}>
                  Test Consistency & Performance
                </span>
                {isFullscreen && <span className="sm:hidden">Performance</span>}
              </CardTitle>

              <RichPopover
                color="cyan"
                title="Reading this chart"
                description="This chart tracks your performance test by test, comparing your score directly against the class average and the batch topper. Tap or hover over any point to see the full details."
                trigger={
                  <Info className="h-4 w-4 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                }
              />
            </div>
            {!isFullscreen && (
              <CardDescription className="text-xs">
                Your normalized test scores compared to the class average and
                top performer.
              </CardDescription>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-end lg:gap-2 lg:self-auto">
            <button
              onClick={() => setFitToScreen((prev) => !prev)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-muted font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground ${
                isFullscreen
                  ? "px-2 py-1.5 text-[10px]"
                  : "px-3 py-1.5 text-xs sm:px-2.5 sm:py-1.5"
              }`}
            >
              {fitToScreen ? (
                <>
                  <ArrowRightLeft className="h-3 w-3" />
                  <span>Enable Scroll</span>
                </>
              ) : (
                <>
                  <Scaling className="h-3 w-3" />
                  <span>Fit to Screen</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-sky-500/10 font-medium text-sky-600 transition-colors hover:bg-sky-500/20 dark:text-sky-500 ${
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
        {chartSafeHistory.length > 0 && (
          <div className="shrink-0 mb-2 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS.topper }}
              />
              Topper Score
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS.average }}
              />
              Class Average
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS.student }}
              />
              Your Score
            </div>
          </div>
        )}
        {chartSafeHistory.length > 0 ? (
          <div
            ref={scrollRef}
            tabIndex={-1}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`custom-scrollbar focus:outline-none [-webkit-tap-highlight-color:transparent] flex-1 min-h-0 focus:outline-none w-full overflow-y-hidden overscroll-x-contain scrollbar-thin ${
              fitToScreen
                ? "overflow-x-hidden"
                : "overflow-x-auto scrollbar-thumb-sky-600"
            } ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${
              isFullscreen ? "touch-none" : ""
            } pb-2`}
          >
            <div
              className="h-full "
              style={{
                width: "100%",
                minWidth: fitToScreen
                  ? "100%"
                  : `max(100%, ${minChartWidth}px)`,
              }}
            >
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                style={{ height: "100%", width: "100%" }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  debounce={100}
                  className={isDragging ? "pointer-events-none" : ""}
                  style={{ outline: "none" }}
                >
                  <LineChart
                    accessibilityLayer={false}
                    style={{ outline: "none" }}
                    data={chartSafeHistory}
                    margin={{
                      top: 15,
                      right: 30,
                      bottom: isMobile ? 10 : 50,
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
                      height={60}
                    >
                      <Label
                        value="Tests (Chronological Order)"
                        offset={fitToScreen ? 0 : -30}
                        position="insideBottom"
                        fill="var(--muted-foreground)"
                        fontSize={12}
                      />
                    </XAxis>
                    <YAxis
                      type="number"
                      domain={[0, 100]}
                      width={isMobile && !isFullscreen ? 30 : 55}
                      tick={{
                        fontSize: isMobile ? 10 : 11,
                        fill: "var(--muted-foreground)",
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                    >
                      {(!isMobile || isFullscreen) && (
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
                    <Line
                      name="Topper Score"
                      type="monotone"
                      dataKey="classHighestPercentage"
                      isAnimationActive={false}
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
                      isAnimationActive={false}
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
                      isAnimationActive={false}
                      stroke={COLORS.student}
                      strokeWidth={3}
                      dot={<CustomStudentDot />}
                      activeDot={<CustomActiveStudentDot />}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No test data available yet."
            description="When test scores are published, your performance history will appear here."
          />
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
            Fullscreen view of the test consistency and performance chart.
          </DialogDescription>

          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
