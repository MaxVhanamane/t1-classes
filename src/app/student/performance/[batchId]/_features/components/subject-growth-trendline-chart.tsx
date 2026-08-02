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

// PREMIUM COLOR PALETTE (High Contrast)
const SUBJECT_COLORS = [
  "#14b8a6", // Teal
  "#f59e0b", // Amber
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

  console.log("hey");
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

    // Normal Mobile: Native swipe is buttery smooth, don't intercept it.
    // Desktop & Rotated Mobile: We intercept to provide drag-to-scroll.
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

    // Magic math: If device is rotated 90 degrees, pulling up (negative Y)
    // means scrolling forward (positive scrollLeft).
    const walk = (isRotated ? deltaY : deltaX) * 1.5;
    scrollRef.current.scrollLeft = startPos.scrollLeft - walk;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

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

  if (chartData.length === 0 || uniqueSubjects.length === 0) return null;

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#64748b";
  const gridColor = isDark ? "#27272a" : "#e2e8f0";

  const minChartWidth = Math.max(700, chartData.length * 100);

  const renderChart = () => (
    <Card
      className={`relative flex flex-col pb-2 overflow-hidden [&_.recharts-wrapper]:outline-none! [&_.recharts-surface]:outline-none! [&_.recharts-wrapper]:[-webkit-tap-highlight-color:transparent] [&_.recharts-surface]:[-webkit-tap-highlight-color:transparent] ${
        isFullscreen
          ? "h-full w-full rounded-none border-none shadow-none"
          : "h-[500px] lg:h-[550px] w-full"
      }`}
    >
      {<DottedBackground className="opacity-30" />}
      {
        <CardGlow
          color="amber"
          hideLightGlow
          className={cn(isFullscreen && "rounded-none opacity-50")}
        />
      }

      <CardHeader
        className={`shrink-0 ${
          isFullscreen ? "p-2 pb-1 sm:p-4 sm:pb-2" : "pb-2"
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CardTitle
                className={`flex items-center gap-2 ${
                  isFullscreen ? "text-sm sm:text-base" : ""
                }`}
              >
                <TrendingUp
                  className={`${
                    isFullscreen ? "h-4 w-4" : "h-5 w-5"
                  } text-amber-500`}
                />
                <span className={isFullscreen ? "hidden sm:inline" : ""}>
                  Subject Growth Trends
                </span>
                {isFullscreen && <span className="sm:hidden">Trends</span>}
              </CardTitle>
              {!isFullscreen && (
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
                          It tracks your percentage score for each subject
                          across all your tests. Each line connects your scores
                          from past to present, showing your timeline of
                          progress.
                        </p>
                      </div>
                      <div>
                        <strong className="text-foreground">
                          How to read the lines?
                        </strong>
                        <p className="mt-0.5">
                          An upward line means you are improving in that
                          subject. A sharp drop means the recent test was either
                          much harder, or you might need to revise that specific
                          topic.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </RichPopover>
              )}
            </div>
            {!isFullscreen && (
              <CardDescription>
                Your percentage score over time, broken down by subject.
              </CardDescription>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-end lg:gap-2 lg:self-auto">
            <button
              onClick={() => setFitToScreen((prev) => !prev)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-muted font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground ${
                isFullscreen
                  ? "px-2 py-1.5 text-[10px]"
                  : "px-3 py-2 text-xs sm:px-2.5 sm:py-1.5"
              }`}
            >
              {fitToScreen ? (
                <>
                  <ArrowRightLeft
                    className={isFullscreen ? "h-3 w-3" : "h-3.5 w-3.5"}
                  />
                  <span>Enable Scroll</span>
                </>
              ) : (
                <>
                  <Scaling
                    className={isFullscreen ? "h-3 w-3" : "h-3.5 w-3.5"}
                  />
                  <span>Fit to Screen</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center justify-center gap-1.5 rounded-md bg-amber-500/10 font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-500 ${
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
        <div className="shrink-0 mb-3 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2">
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`custom-scrollbar flex-1 min-h-0 w-full overflow-y-hidden overscroll-x-contain scrollbar-thin ${
            fitToScreen
              ? "overflow-x-hidden"
              : "overflow-x-auto scrollbar-thumb-amber-600"
          } ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${
            isFullscreen ? "touch-none" : ""
          } pb-2`}
        >
          <div
            className="h-full"
            style={{
              // Desktop width fix: Ensures it takes minimum 100% of screen
              width: "100%",
              minWidth: fitToScreen ? "100%" : `max(100%, ${minChartWidth}px)`,
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
              >
                <LineChart
                  accessibilityLayer={false}
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
                      fitToScreen ? false : <CustomXAxisTick data={chartData} />
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

                  {/* GAP FIX: Massive container (100px width) with huge offset strictly enforces clearance */}
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
            Fullscreen view of the subject growth trends chart.
          </DialogDescription>

          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card max-md:portrait:top-1/2 max-md:portrait:left-1/2 max-md:portrait:h-[100dvw] max-md:portrait:w-[100dvh] max-md:portrait:-translate-x-1/2 max-md:portrait:-translate-y-1/2 max-md:portrait:rotate-90 ">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
