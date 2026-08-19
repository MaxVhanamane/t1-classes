"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Info,
  Maximize2,
  Minimize2,
  Scaling,
  ArrowRightLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
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

import { SubjectHistoryNode } from "../types/performance.types";
import { cn } from "@/src/lib/utils";
import { EmptyState } from "./empty-state";

// PREMIUM COLOR PALETTE (High Contrast)
const SUBJECT_COLORS = [
  "#14b8a6", // Teal
  "#f59e0b", // lime
  "#0ea5e9", // Sky Blue
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#f97316", // Orange
  "#8b5cf6", // Violet
];

interface SubjectGrowthTrendlineChartProps {
  subjectGrowthTrends: SubjectHistoryNode[];
  isMobile: boolean;
}

interface ChartDataRow {
  uniqueChartKey: string;
  testName: string;
  testDate: string;
  [key: string]: string | number;
}

interface TrendXAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  data: ChartDataRow[];
}

interface TrendTooltipPayload {
  color: string;
  name: string;
  value: number;
  payload: Record<string, string | number>;
}

interface CustomTrendTooltipProps {
  active?: boolean;
  payload?: TrendTooltipPayload[];
}

const CustomXAxisTick = ({
  x = 0,
  y = 0,
  payload,
  data,
}: TrendXAxisTickProps) => {
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
      transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
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

const CustomTrendTooltip = ({ active, payload }: CustomTrendTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;

    return (
      <div className="min-w-[210px] overflow-hidden rounded-lg border border-border/60 bg-background/95 p-2.5 text-foreground shadow-lg backdrop-blur-2xl">
        <div className="mb-2 border-b border-border/50 pb-2 dark:border-zinc-800/80">
          <h4 className="text-xs font-bold tracking-wide text-foreground dark:text-white">
            {data.testName}
          </h4>
          <p className="mt-0.5 text-[10px] uppercase text-muted-foreground">
            {data.testDate}
          </p>
        </div>
        <div className="mt-2 space-y-1.5">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-border/40 bg-muted/40 px-2 py-1.5 text-[11px] dark:border-zinc-800/40 dark:bg-zinc-900/60"
            >
              <span className="flex items-center gap-1.5 capitalize text-muted-foreground dark:text-zinc-300">
                <span
                  className="h-1.5 w-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="font-bold text-foreground dark:text-white">
                {Number(entry.value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SubjectGrowthTrendlineChart({
  subjectGrowthTrends,
  isMobile,
}: SubjectGrowthTrendlineChartProps) {
  const { resolvedTheme } = useTheme();
  const [fitToScreen, setFitToScreen] = useState(false);
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
      } catch {}
    };

    void lockLandscape();

    return () => {
      try {
        const orientation = screen.orientation as
          | (ScreenOrientation & { unlock?: () => void })
          | undefined;
        orientation?.unlock?.();
      } catch {}
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

  const { chartData, uniqueSubjects } = useMemo(() => {
    if (!subjectGrowthTrends || subjectGrowthTrends.length === 0) {
      return { chartData: [], uniqueSubjects: [] };
    }

    const subjectsSet = new Set<string>();

    const data = subjectGrowthTrends.map((test, index) => {
      const row: ChartDataRow = {
        uniqueChartKey: `${test.testId}-${index}`,
        testName: test.testName,
        testDate: test.testDate,
      };

      const subjectGroups: Record<string, number[]> = {};
      test.subjects.forEach((sub) => {
        if (!subjectGroups[sub.subject]) {
          subjectGroups[sub.subject] = [];
        }
        subjectGroups[sub.subject].push(sub.percentage);
      });

      Object.keys(subjectGroups).forEach((sub) => {
        subjectsSet.add(sub);
        const sum = subjectGroups[sub].reduce((acc, curr) => acc + curr, 0);
        row[sub] = sum / subjectGroups[sub].length;
      });

      return row;
    });

    return { chartData: data, uniqueSubjects: Array.from(subjectsSet) };
  }, [subjectGrowthTrends]);

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#64748b";
  const gridColor = isDark ? "#27272a" : "#e2e8f0";

  const minChartWidth = Math.max(700, chartData.length * 100);
  const hasData = chartData.length > 0 && uniqueSubjects.length > 0;

  const renderChart = () => (
    <Card
      className={`relative gap-3 flex flex-col pb-0 overflow-hidden [&_.recharts-wrapper]:outline-none! [&_.recharts-surface]:outline-none! [&_.recharts-wrapper]:[-webkit-tap-highlight-color:transparent] [&_.recharts-surface]:[-webkit-tap-highlight-color:transparent] ${
        isFullscreen
          ? "h-full w-full rounded-none border-none shadow-none pt-4"
          : "h-[500px] lg:h-[550px] w-full"
      }`}
    >
      <DottedBackground className="opacity-30" />
      <CardGlow
        color="lime"
        hideLightGlow
        className={cn(isFullscreen && "rounded-none opacity-50")}
      />

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
                <TrendingUp
                  className={`${
                    isFullscreen ? "h-4 w-4" : "h-5 w-5"
                  } text-lime-500`}
                />
                <span className={isFullscreen ? "hidden sm:inline" : ""}>
                  Subject Growth Trends
                </span>
                {isFullscreen && <span className="sm:hidden">Trends</span>}
              </CardTitle>

              <RichPopover
                color="yellow"
                title="Understanding Growth Trends"
                trigger={
                  <Info className="h-4 w-4 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                }
              >
                <ScrollArea className="h-[180px] w-full max-w-[260px] pr-3 sm:h-auto sm:max-h-[320px] sm:max-w-[320px]">
                  <div className="space-y-3.5 break-words whitespace-normal text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <strong className="text-foreground">
                        What does this chart show?
                      </strong>
                      <p className="mt-0.5">
                        It tracks your percentage score for each subject across
                        all your tests. Each line connects your scores from past
                        to present, showing your timeline of progress.
                      </p>
                    </div>
                    <div>
                      <strong className="text-foreground">
                        How to read the lines?
                      </strong>
                      <p className="mt-0.5">
                        An upward line means you are improving in that subject.
                        A sharp drop means the recent test was either much
                        harder, or you might need to revise that specific topic.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </RichPopover>
            </div>
            {!isFullscreen && (
              <CardDescription className="text-xs">
                Your percentage score over time, broken down by subject.
              </CardDescription>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-end lg:gap-2 lg:self-auto">
            {hasData && (
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
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-lime-500/10 font-medium text-lime-600 transition-colors hover:bg-lime-500/20 dark:text-lime-500 ${
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
        {hasData ? (
          <>
            <div className="shrink-0 mb-2 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-2">
              {uniqueSubjects.map((subject, index) => (
                <div
                  key={subject}
                  className="flex items-center gap-1.5 text-[11px] font-medium capitalize text-foreground sm:text-xs"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        SUBJECT_COLORS[index % SUBJECT_COLORS.length],
                    }}
                  />
                  {subject}
                </div>
              ))}
            </div>

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
                  : "overflow-x-auto scrollbar-thumb-lime-600"
              } ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${
                isFullscreen ? "touch-none" : ""
              } pb-2`}
            >
              <div
                className="h-full"
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
                      data={chartData}
                      margin={{
                        top: 10,
                        right: isMobile ? 40 : 30,
                        bottom: 10,
                        left: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={gridColor}
                      />
                      <XAxis
                        dataKey="uniqueChartKey"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={60}
                        tick={
                          fitToScreen ? (
                            false
                          ) : (
                            <CustomXAxisTick data={chartData} />
                          )
                        }
                        dy={12}
                      >
                        {(!isMobile || isFullscreen) && (
                          <Label
                            value="Timeline (Chronological Tests)"
                            offset={fitToScreen ? 0 : -40}
                            position="insideBottom"
                            fill="var(--muted-foreground)"
                            fontSize={12}
                          />
                        )}
                      </XAxis>
                      <YAxis
                        width={isMobile && !isFullscreen ? 55 : 60}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val: number) => `${val}%`}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        ticks={[0, 25, 50, 75, 100]}
                        domain={[0, 100]}
                        interval={0}
                        dx={0}
                      >
                        {(!isMobile || isFullscreen) && (
                          <Label
                            value="Percentage (%)"
                            angle={-90}
                            position="insideLeft"
                            style={{ textAnchor: "middle" }}
                            fill="var(--muted-foreground)"
                            fontSize={12}
                            offset={isMobile && !isFullscreen ? 15 : 10}
                          />
                        )}
                      </YAxis>
                      <RechartsTooltip
                        cursor={{
                          stroke: isDark ? "#52525b" : "#94a3b8",
                          strokeWidth: 1.5,
                          strokeDasharray: "4 4",
                        }}
                        content={(props) => (
                          <CustomTrendTooltip
                            active={props.active}
                            payload={
                              props.payload as unknown as TrendTooltipPayload[]
                            }
                          />
                        )}
                      />
                      {uniqueSubjects.map((subject, index) => (
                        <Line
                          key={subject}
                          type="monotone"
                          dataKey={subject}
                          name={subject}
                          stroke={SUBJECT_COLORS[index % SUBJECT_COLORS.length]}
                          strokeWidth={2.5}
                          dot={{
                            r: 4,
                            fill: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
                            strokeWidth: 2,
                            stroke: "var(--background)",
                          }}
                          activeDot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "var(--background)",
                          }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No growth trends available yet"
            description="Complete more tests across different subjects to view your performance progression over time."
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
            Fullscreen view of the subject growth trends chart.
          </DialogDescription>
          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
