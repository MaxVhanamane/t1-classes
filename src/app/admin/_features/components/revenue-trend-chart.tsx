"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Maximize2, Minimize2, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import DottedBackground from "@/src/components/dotted-background";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

import { useRevenueTrend } from "../hooks/use-revenue-trend";

// --- CUSTOM TOOLTIP ---
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: RevenueDataPoint;
    value: number;
    name: string;
    color?: string;
  }[];
}

const CustomRevenueTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const netRevenue = data.net_revenue ?? data.gross_revenue - data.refunds;

    const formatMoney = (val: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(val);

    return (
      <div className="w-[180px] overflow-hidden rounded-lg border border-border/60 bg-background/95 backdrop-blur-2xl p-2.5 text-foreground shadow-lg">
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
            <span
              className={`text-xs font-bold ${
                netRevenue >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatMoney(netRevenue)}
            </span>
            <span className="text-[9px] text-muted-foreground">
              Net Revenue
            </span>
          </div>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#4f46e5" }} // Indigo
              />
              <span className="text-muted-foreground dark:text-zinc-300">
                Gross
              </span>
            </div>
            <span className="font-semibold" style={{ color: "#4f46e5" }}>
              {formatMoney(data.gross_revenue)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 border border-border/40 dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#f43f5e" }} // Rose
              />
              <span className="text-muted-foreground dark:text-zinc-300">
                Refunds
              </span>
            </div>
            <span className="font-semibold" style={{ color: "#f43f5e" }}>
              {formatMoney(data.refunds)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- CUSTOM BARS ---
interface RevenueDataPoint {
  month: string;
  gross_revenue: number;
  refunds: number;
  net_revenue: number;
}

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: RevenueDataPoint;
}

const CustomGrossBar = (props: CustomBarProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload, fill } = props;
  const hasRefunds = payload?.refunds && payload.refunds > 0;
  const adjustedX = hasRefunds ? x : x + width / 2 + 1;

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

const CustomRefundBar = (props: CustomBarProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload, fill } = props;
  const hasGross = payload?.gross_revenue && payload.gross_revenue > 0;
  const adjustedX = hasGross ? x : x - width / 2 - 1;

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

// --- MAIN COMPONENT ---
export function RevenueTrendChart() {
  const { resolvedTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [months, setMonths] = useState<number>(6);

  const { data, isLoading, isError } = useRevenueTrend(months);

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
        // Fall back gracefully
      }
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

  // Styling Variables
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#64748b";
  const gridColor = isDark ? "#27272a" : "#e2e8f0";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Revenue Math
  const totalNetRevenue = data
    ? data.reduce((acc, curr) => acc + curr.net_revenue, 0)
    : 0;

  const formattedNetTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalNetRevenue);

  const formatYAxis = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  // Dynamic width based on months to ensure scrolling
  const minChartWidth = Math.max(500, months * 80);

  if (isError) {
    return (
      <Card className="col-span-1 flex h-[500px] items-center justify-center rounded-xl border bg-card shadow-sm md:col-span-2">
        <p className="text-sm text-muted-foreground">
          Failed to load revenue data.
        </p>
      </Card>
    );
  }

  const renderChart = () => (
    <Card
      className={`col-span-1 md:col-span-2 shadow-none relative gap-3 flex flex-col pb-0 overflow-hidden [&_.recharts-wrapper]:outline-none! [&_.recharts-surface]:outline-none! [&_.recharts-wrapper]:[-webkit-tap-highlight-color:transparent] [&_.recharts-surface]:[-webkit-tap-highlight-color:transparent] ${
        isFullscreen
          ? "h-full w-full rounded-none border-none shadow-none pt-4"
          : "h-[500px] w-full"
      }`}
    >
      <DottedBackground className="opacity-30" />
      {/* <CardGlow
        color="indigo"
        hideLightGlow
        className={cn(isFullscreen && "rounded-none opacity-50")}
      /> */}

      <CardHeader className="px-3 sm:px-6">
        <div
          className={cn(
            "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
            isFullscreen && "flex-row justify-between",
          )}
        >
          <div className="space-y-1.5">
            <CardTitle
              className={`tracking-tight ${
                isFullscreen
                  ? "text-sm sm:text-base"
                  : "text-base font-semibold"
              }`}
            >
              Revenue & Refunds
            </CardTitle>
            {!isFullscreen && (
              <CardDescription className="text-xs">
                Collection history over the last {months} months
              </CardDescription>
            )}
          </div>

          <div className="flex flex-wrap shrink-0 items-center gap-2 sm:gap-3 self-start lg:self-auto">
            {!isLoading && (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-medium ${
                  totalNetRevenue >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {totalNetRevenue >= 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                Net: {formattedNetTotal}
              </div>
            )}

            <Select
              value={months.toString()}
              onValueChange={(v) => setMonths(Number(v))}
            >
              <SelectTrigger className="w-[120px] sm:w-[130px] rounded-lg h-8 sm:h-9 bg-background text-xs sm:text-sm">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="9">Last 9 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-400 ${
                isFullscreen
                  ? "px-2 py-1.5 text-[10px]"
                  : "px-2.5 py-1.5 sm:px-3 sm:h-9 text-[11px] sm:text-xs"
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Full Screen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden px-3 pb-0 sm:px-6">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-md opacity-50" />
        ) : data && data.length > 0 ? (
          <>
            {/* CUSTOM HTML LEGEND */}
            <div className="shrink-0 mb-2 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "#4f46e5" }} // Indigo
                />
                Gross Revenue
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground sm:text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "#f43f5e" }} // Rose
                />
                Refunds
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
              className={`custom-scrollbar focus:outline-none [-webkit-tap-highlight-color:transparent] flex-1 min-h-0 w-full overflow-y-hidden overflow-x-auto scrollbar-thumb-indigo-600 overscroll-x-contain scrollbar-thin ${
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
                    data={data}
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
                        id="grossGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#4f46e5"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                      <linearGradient
                        id="refundGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#f43f5e"
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
                      width={isMobile ? 35 : 55}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      dx={-5}
                      tickFormatter={formatYAxis}
                    >
                      {!isMobile && (
                        <Label
                          value="Amount (INR)"
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
                      content={<CustomRevenueTooltip />}
                      cursor={{
                        fill: isDark ? "#27272a" : "#f1f5f9",
                        opacity: 0.4,
                      }}
                    />

                    <Bar
                      name="Gross Revenue"
                      dataKey="gross_revenue"
                      fill="url(#grossGradient)"
                      maxBarSize={20}
                      shape={<CustomGrossBar />}
                    />
                    <Bar
                      name="Refunds"
                      dataKey="refunds"
                      fill="url(#refundGradient)"
                      maxBarSize={20}
                      shape={<CustomRefundBar />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 h-full items-center justify-center rounded-lg bg-muted/10 text-sm text-muted-foreground">
            No revenue data found.
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Standard In-Page Render */}
      {!isFullscreen && renderChart()}

      {/* Fullscreen dialog portal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="m-0 h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-none bg-card p-0 shadow-none outline-none focus:outline-none focus-visible:outline-none sm:max-w-none [&>button]:hidden">
          <DialogTitle className="sr-only">Fullscreen Chart</DialogTitle>
          <DialogDescription className="sr-only">
            Fullscreen view of the revenue trends chart.
          </DialogDescription>

          <div className="absolute left-0 top-0 flex h-[100dvh] w-[100dvw] flex-col bg-card">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
