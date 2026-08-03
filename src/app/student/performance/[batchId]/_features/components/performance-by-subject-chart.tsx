"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, Info, Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "next-themes";
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
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import DottedBackground from "@/src/components/dotted-background";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { SubjectPerformance } from "../types/performance.types";
import { cn } from "@/src/lib/utils";

interface PerformanceBySubjectChartProps {
  performanceBySubject: SubjectPerformance[];
  isMobile: boolean;
}

// --- STRICT TYPES FOR RECHARTS PAYLOAD (NO ANY) ---
interface MasteryTooltipPayload {
  payload: SubjectPerformance;
}

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: MasteryTooltipPayload[];
}

// --- STRICT RECHARTS TOOLTIP TYPING ---
const CustomBarTooltip = ({ active, payload }: CustomBarTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as SubjectPerformance;

    // Calculate total questions attempted/faced in this subject
    const totalQs =
      data.accuracyBreakdown.correct +
      data.accuracyBreakdown.wrong +
      data.accuracyBreakdown.partial +
      data.accuracyBreakdown.unanswered;

    return (
      <div className="w-[240px] overflow-hidden rounded-xl border border-border/60 bg-background/95 p-3 text-foreground shadow-xl backdrop-blur-2xl">
        {/* Tooltip Header */}
        <div className="mb-2.5 flex items-center justify-between border-b border-border/50 pb-2 dark:border-zinc-800/80">
          <div>
            <h4 className="text-[13px] font-bold tracking-wide text-foreground capitalize dark:text-white">
              {data.subject}
            </h4>
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              {data.obtainedMarks} / {data.totalMarks} Marks
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-teal-600 dark:text-teal-400">
              {data.studentPercentage.toFixed(1)}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Score
            </span>
          </div>
        </div>

        {/* Beautiful & Airy Layout */}
        <div className="flex flex-col gap-2.5">
          {/* Context Row - Soft pill shape */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5 dark:bg-zinc-900/50">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                Class Avg:{" "}
                <span className="font-semibold text-foreground dark:text-white">
                  {data.classAveragePercentage.toFixed(1)}%
                </span>
              </span>
            </div>
            <div className="h-3 w-px bg-border" /> {/* Sleek divider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                Total Qs:{" "}
                <span className="font-semibold text-foreground dark:text-white">
                  {totalQs}
                </span>
              </span>
            </div>
          </div>

          {/* 2x2 Grid - Clean text with glowing indicator dots */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
            {/* Correct */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] text-muted-foreground">
                  Correct
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {data.accuracyBreakdown.correct}
              </span>
            </div>

            {/* Wrong */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]" />
                <span className="text-[11px] text-muted-foreground">Wrong</span>
              </div>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                {data.accuracyBreakdown.wrong}
              </span>
            </div>

            {/* Partial */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                <span className="text-[11px] text-muted-foreground">
                  Partial
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {data.accuracyBreakdown.partial}
              </span>
            </div>

            {/* Skipped */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shadow-[0_0_4px_rgba(148,163,184,0.5)]" />
                <span className="text-[11px] text-muted-foreground">
                  Skipped
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {data.accuracyBreakdown.unanswered}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceBySubjectChart({
  performanceBySubject,
  isMobile,
}: PerformanceBySubjectChartProps) {
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
  //
  // NOTE: placed above the `!performanceBySubject` early return below so
  // hook call order stays consistent across renders (rules of hooks).
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

  if (!performanceBySubject || performanceBySubject.length === 0) return null;

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#64748b";
  const gridColor = isDark ? "#27272a" : "#e2e8f0";

  // Dynamic width based on the number of subjects to ensure scrolling activates when there are many bars
  const minChartWidth = Math.max(600, performanceBySubject.length * 80);

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
          color="teal"
          hideLightGlow
          className={cn(isFullscreen && "rounded-none opacity-50")}
        />
      }

      <CardHeader className="px-3 sm:px-6">
        <div
          className={cn(
            "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
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
                <BookOpen
                  className={`${
                    isFullscreen ? "h-4 w-4" : "h-5 w-5"
                  } text-teal-500`}
                />
                <span className={isFullscreen ? "hidden sm:inline" : ""}>
                  Performance by Subject
                </span>
                {isFullscreen && (
                  <span className="sm:hidden">Performance by Subject</span>
                )}
              </CardTitle>

              <RichPopover
                color="teal"
                title="Understanding This Chart"
                trigger={
                  <Info className="h-4 w-4 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                }
              >
                <ScrollArea className="h-[180px] w-full pr-3 sm:h-[220px]">
                  <div className="space-y-3.5 break-words whitespace-normal text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <strong className="text-foreground">
                        How are these scores calculated?
                      </strong>
                      <p className="mt-0.5">
                        This chart combines all your results from{" "}
                        <strong>every test you have taken so far</strong> in
                        this batch. It adds up every single question you&apos;ve
                        answered to show your overall percentage in each
                        subject.
                      </p>
                    </div>

                    <div>
                      <strong className="text-foreground">
                        What does the hover menu show?
                      </strong>
                      <p className="mt-0.5">
                        When you hover over your bar, you will see exactly how
                        many questions you faced, got right, got wrong, or
                        skipped. A high &quot;skipped&quot; number might mean
                        you run out of time or struggle with the concepts. A
                        high &quot;incorrect&quot; number means you might need
                        to review that subject more carefully.
                      </p>
                    </div>

                    <div className="rounded-md border border-border/40 bg-muted/30 p-2.5 dark:bg-muted/10">
                      <strong className="text-foreground">
                        Why look at the Class Average?
                      </strong>
                      <p className="mt-0.5">
                        The gray bar shows how everyone else is doing. If your
                        score feels low, but it is still higher than the class
                        average, it just means the tests for that subject have
                        been really difficult for everyone!
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </RichPopover>
            </div>
            {!isFullscreen && (
              <CardDescription className="text-xs">
                Your total percentage in each subject across all your tests.
              </CardDescription>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-end lg:gap-2 lg:self-auto">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-teal-500/10 font-medium text-teal-600 transition-colors hover:bg-teal-500/20 dark:text-teal-500 ${
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
        {/* NEW CUSTOM HTML LEGEND */}
        <div className="shrink-0 mb-2 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
            Your Score
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: isDark ? "#52525b" : "#94a3b8" }}
            />
            Class Average
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
          className={`custom-scrollbar focus:outline-none [-webkit-tap-highlight-color:transparent] flex-1 min-h-0 focus:outline-none w-full overflow-y-hidden overflow-x-auto scrollbar-thumb-teal-600 overscroll-x-contain scrollbar-thin ${
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
                data={performanceBySubject}
                margin={{
                  top: 10, // Gives the chart maximum vertical breathing room
                  right: isMobile ? 4 : 10,
                  bottom: isMobile ? 15 : 30,
                  left: isMobile ? 0 : 10,
                }}
                barGap={4}
              >
                <defs>
                  <linearGradient
                    id="studentBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient
                    id="averageBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={isDark ? "#52525b" : "#94a3b8"}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={isDark ? "#3f3f46" : "#cbd5e1"}
                      stopOpacity={0.3}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={gridColor}
                />
                <XAxis
                  dataKey="subject"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: axisColor,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                  tickFormatter={(val: string) =>
                    val.charAt(0).toUpperCase() + val.slice(1)
                  }
                  dy={12}
                >
                  {!isMobile && (
                    <Label
                      value="Subjects"
                      offset={-20}
                      position="insideBottom"
                      fill="var(--muted-foreground)"
                      fontSize={12}
                    />
                  )}
                </XAxis>
                <YAxis
                  width={isMobile ? 35 : 45}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickFormatter={(val: number) => `${val}%`}
                  domain={[0, 100]}
                  dx={0}
                >
                  {!isMobile && (
                    <Label
                      value="Percentage (%)"
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
                  cursor={{
                    fill: isDark ? "#27272a" : "#f1f5f9",
                    opacity: 0.4,
                  }}
                  content={(props) => (
                    <CustomBarTooltip
                      active={props.active}
                      payload={
                        props.payload as unknown as MasteryTooltipPayload[]
                      }
                    />
                  )}
                />

                {/* THE RECHARTS <Legend /> HAS BEEN REMOVED FROM HERE */}

                <Bar
                  name="Your Score"
                  dataKey="studentPercentage"
                  fill="url(#studentBarGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={isMobile ? 16 : 20}
                  animationDuration={1200}
                />

                <Bar
                  name="Class Average"
                  dataKey="classAveragePercentage"
                  fill="url(#averageBarGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={isMobile ? 16 : 20}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
            Fullscreen view of the performance by subject chart.
          </DialogDescription>

          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
