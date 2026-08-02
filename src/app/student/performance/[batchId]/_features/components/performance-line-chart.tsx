"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
              <TooltipContent side="bottom" className="z-50 text-xs">
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
        className={`rounded-xl border ${data.isTopper ? "border-amber-500/40 shadow-amber-500/10" : "border-border"} bg-background/95 shadow-md backdrop-blur-md overflow-hidden ${isMobile ? "max-w-[210px] p-3" : "max-w-[240px] p-4"}`}
      >
        {data.isTopper && <CardGlow color="amber" />}
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

        <div className={`space-y-2 font-medium text-xs`}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-500">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 sm:h-2 sm:w-2" />{" "}
              Your Score
            </span>
            <span className="font-bold">
              {data.studentScore.toFixed(0)} / {data.totalMarks}{" "}
              <span className="font-normal text-muted-foreground">
                ({data.studentPercentage.toFixed(1)}%)
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
                  ({data.classHighestPercentage.toFixed(1)}%)
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
              {data.classAverage.toFixed(1)} / {data.totalMarks}{" "}
              <span className="font-normal text-muted-foreground">
                ({data.classAvgPercentage.toFixed(1)}%)
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
              {data.percentile.toFixed(1)} %
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

  // 1. SCROLL LOCK HOOK for Shadcn Dialog
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  // 2. GRAB AND DRAG SCROLLING LOGIC
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const minChartWidth = Math.max(700, chartSafeHistory.length * 120);

  const renderChart = () => (
    <Card
      className={`relative overflow-hidden ${isFullscreen ? "h-full w-full flex flex-col rounded-none border-none shadow-none" : ""}`}
    >
      {!isFullscreen && <DottedBackground className="opacity-30" />}
      {!isFullscreen && <CardGlow color="sky" />}

      <CardHeader className={isFullscreen ? "shrink-0" : ""}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
              Your normalized test scores compared to the class average and top
              performer.
            </CardDescription>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-end lg:gap-2 lg:self-auto">
            <button
              onClick={() => setFitToScreen((prev) => !prev)}
              className="flex items-center justify-center gap-1.5 rounded-md bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground sm:px-2.5 sm:py-1.5"
            >
              {fitToScreen ? (
                <>
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>Enable Scroll</span>
                </>
              ) : (
                <>
                  <Scaling className="h-3.5 w-3.5" />
                  <span>Fit to Screen</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center justify-center gap-1.5 rounded-md bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-500/20 dark:text-sky-500 sm:px-2.5 sm:py-1.5"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
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

      <CardContent
        className={`pt-2 ${isFullscreen ? "flex-1 min-h-0 flex flex-col" : ""}`}
      >
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          tabIndex={-1}
          className={`custom-scrollbar w-full pb-6 outline-none focus:outline-none ${
            fitToScreen
              ? "overflow-x-hidden"
              : "overflow-x-auto scrollbar-thumb-sky-600"
          } ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${
            isFullscreen ? "flex-1 min-h-0" : ""
          }`}
        >
          {chartSafeHistory.length > 0 ? (
            <div style={{ height: isFullscreen ? "100%" : "450px" }}>
              <motion.div
                initial={false}
                animate={{ width: fitToScreen ? "100%" : `${minChartWidth}px` }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                style={{ height: "100%", minWidth: "100%" }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  debounce={100}
                  className={isDragging ? "pointer-events-none" : ""}
                >
                  <LineChart
                    data={chartSafeHistory}
                    margin={{
                      top: 20,
                      right: isMobile ? 15 : 30,
                      bottom: isMobile ? 20 : 50,
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
                        offset={fitToScreen ? 0 : -40}
                        position="insideBottom"
                        fill="var(--muted-foreground)"
                        fontSize={12}
                      />
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
          ) : (
            <div className="flex h-[450px] items-center justify-center rounded-lg bg-muted/10 text-sm text-muted-foreground">
              No test data available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {!isFullscreen && renderChart()}

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="m-0 h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-none bg-card p-0 shadow-none sm:max-w-none sm:rounded-none [&>button]:hidden">
          <DialogTitle className="sr-only">Fullscreen Chart</DialogTitle>
          <DialogDescription className="sr-only">
            Fullscreen view of the performance chart.
          </DialogDescription>
          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card max-md:portrait:top-1/2 max-md:portrait:left-1/2 max-md:portrait:h-[100dvw] max-md:portrait:w-[100dvh] max-md:portrait:-translate-x-1/2 max-md:portrait:-translate-y-1/2 max-md:portrait:rotate-90">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
