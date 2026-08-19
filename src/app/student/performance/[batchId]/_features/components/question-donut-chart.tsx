"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence, animate, useInView } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import DottedBackground from "@/src/components/dotted-background";
import { EmptyState } from "./empty-state";

const GRADIENT_MAP: Record<
  string,
  { start: string; end: string; solid: string }
> = {
  correct: { start: "#34d399", end: "#059669", solid: "#10b981" },
  wrong: { start: "#fb7185", end: "#e11d48", solid: "#f43f5e" },
  partial: { start: "#fbbf24", end: "#d97706", solid: "#f59e0b" },
  unanswered: { start: "#94a3b8", end: "#475569", solid: "#64748b" },
};

const FALLBACK_GRADIENTS = [
  { start: "#34d399", end: "#059669", solid: "#10b981" },
  { start: "#fb7185", end: "#e11d48", solid: "#f43f5e" },
  { start: "#fbbf24", end: "#d97706", solid: "#f59e0b" },
  { start: "#94a3b8", end: "#475569", solid: "#64748b" },
];

const MAX_GROWTH = 7;
const GROW_DURATION = 0.12; // fast tween in, seconds
const SHRINK_DURATION = 0.14; // fast tween out, seconds
const LEAVE_DELAY = 40;

interface EnrichedChartData {
  name: string;
  value: number;
  fill: string;
  solidColor: string;
  gradient: { start: string; end: string; solid: string };
}

interface CustomSectorProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  index: number;
  payload: EnrichedChartData;
}

interface QuestionDonutChartProps {
  donutData: Array<{ name: string; value: number; fill?: string }>;
  overallAccuracy: number;
}

export function QuestionDonutChart({
  donutData,
  overallAccuracy,
}: QuestionDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [growIndex, setGrowIndex] = useState<number | null>(null);
  const [growth, setGrowth] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const growthAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const growthRef = useRef(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const isChartInView = useInView(chartRef, { once: true, margin: "-50px" });

  useEffect(() => {
    growthRef.current = growth;
  }, [growth]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsTouchDevice(!mq.matches);
    const listener = (e: MediaQueryListEvent) => setIsTouchDevice(!e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const clearAll = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    growthAnimRef.current?.stop();
    setActiveIndex(null);
    setGrowIndex(null);
    setGrowth(0);
    growthRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      growthAnimRef.current?.stop();
    };
  }, []);

  // Tap-outside-to-deselect (touch)
  useEffect(() => {
    if (!isTouchDevice) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!chartRef.current) return;
      if (!chartRef.current.contains(e.target as Node)) {
        deselectSlice(true);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouchDevice]);

  // Safety net #1: chart scrolls out of view mid-animation
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) clearAll();
      },
      { threshold: 0 },
    );
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, [clearAll]);

  // Safety net #2: tab loses focus / user alt-tabs mid-hover
  useEffect(() => {
    const handleBlurOrHide = () => clearAll();
    window.addEventListener("blur", handleBlurOrHide);
    document.addEventListener("visibilitychange", handleBlurOrHide);
    return () => {
      window.removeEventListener("blur", handleBlurOrHide);
      document.removeEventListener("visibilitychange", handleBlurOrHide);
    };
  }, [clearAll]);

  const animateGrowthTo = (target: number, onDone?: () => void) => {
    growthAnimRef.current?.stop();
    growthAnimRef.current = animate(growthRef.current, target, {
      type: "tween",
      duration: target > growthRef.current ? GROW_DURATION : SHRINK_DURATION,
      ease: "easeOut",
      onUpdate: (v) => {
        growthRef.current = v;
        setGrowth(v);
      },
      onComplete: onDone,
    });
  };

  const chartData: EnrichedChartData[] = donutData.map((item, index) => {
    const normalizedKey = item.name.toLowerCase().trim();
    const grad =
      GRADIENT_MAP[normalizedKey] ||
      FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

    return {
      ...item,
      fill: `url(#donut-grad-${index})`,
      solidColor: grad.solid,
      gradient: grad,
    };
  });

  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;
  const activePercent =
    activeItem && total > 0 ? (activeItem.value / total) * 100 : 0;

  const selectSlice = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveIndex(index);
    setGrowIndex(index);
    animateGrowthTo(MAX_GROWTH);
  };

  const deselectSlice = (immediate = false) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveIndex(null);
    if (immediate) {
      growthAnimRef.current?.stop();
      setGrowth(0);
      growthRef.current = 0;
      setGrowIndex(null);
    } else {
      animateGrowthTo(0, () => setGrowIndex(null));
    }
  };

  const onPieEnter = (_: unknown, index: number) => {
    if (isTouchDevice) return;
    selectSlice(index);
  };

  const onPieLeave = () => {
    if (isTouchDevice) return;
    hoverTimeoutRef.current = setTimeout(
      () => deselectSlice(false),
      LEAVE_DELAY,
    );
  };

  const onContainerMouseLeave = () => {
    if (isTouchDevice) return;
    deselectSlice(true);
  };

  const onSliceTap = (index: number) => {
    if (!isTouchDevice) return;
    if (activeIndex === index) {
      deselectSlice(false);
    } else {
      selectSlice(index);
    }
  };

  const renderShape = (props: unknown) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      index,
      payload,
    } = props as CustomSectorProps;

    const isActive = activeIndex === index;
    const isFaded = activeIndex !== null && !isActive;
    const isGrowing = growIndex === index;
    const appliedOuter = outerRadius + (isGrowing ? growth : 0);

    return (
      <g
        style={{
          opacity: isFaded ? 0.35 : 1,
          transition: "opacity 0.2s ease-out",
        }}
      >
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={appliedOuter}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={payload.fill}
          stroke={isActive ? payload.solidColor : "transparent"}
          strokeWidth={isActive ? 1.5 : 0}
          style={{
            filter: isActive ? `brightness(1.06)` : "none",
            outline: "none",
          }}
        />
      </g>
    );
  };

  return (
    <Card className="relative w-full overflow-hidden border-border/60 bg-card/60 backdrop-blur-xl [&_.recharts-wrapper]:outline-none! [&_.recharts-surface]:outline-none! [&_.recharts-wrapper]:[-webkit-tap-highlight-color:transparent] [&_.recharts-surface]:[-webkit-tap-highlight-color:transparent]">
      <DottedBackground className="opacity-20" />
      <CardGlow color="indigo" hideLightGlow />

      {/* Restored Header with clearer wording */}
      <CardHeader>
        <CardTitle className="tracking-tight">Question Distribution</CardTitle>
        <CardDescription className="text-xs">
          Breakdown of how you answered every question across all tests.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex h-[380px] flex-col items-center justify-center pb-6 pt-0">
        {chartData.length > 0 ? (
          <div
            ref={chartRef}
            className="relative h-[240px] w-full shrink-0"
            onMouseLeave={onContainerMouseLeave}
          >
            {isChartInView && (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={1}
                minHeight={1}
              >
                <PieChart
                  accessibilityLayer={false}
                  style={{ outline: "none" }}
                >
                  <defs>
                    {chartData.map((entry, index) => (
                      <linearGradient
                        key={`donut-grad-${index}`}
                        id={`donut-grad-${index}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={entry.gradient.start} />
                        <stop offset="100%" stopColor={entry.gradient.end} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    onClick={(_, index) => onSliceTap(index)}
                    shape={renderShape}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {activeItem ? (
                  <motion.div
                    key={activeItem.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <span
                      className="text-3xl font-extrabold tracking-tight"
                      style={{ color: activeItem.solidColor }}
                    >
                      {activeItem.value}
                    </span>
                    <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                      {activeItem.name} · {activePercent.toFixed(0)}%
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="overall"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: isChartInView ? 1 : 0,
                      y: isChartInView ? 0 : 10,
                      scale: 1,
                    }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      {overallAccuracy.toFixed(1)}%
                    </span>
                    <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                      Accuracy
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No questions attempted yet"
            description="Your question accuracy breakdown will appear here once you complete a test."
          />
        )}

        {chartData.length > 0 && (
          <div className="mt-6 flex w-full flex-wrap justify-center gap-2.5 px-2 text-xs">
            {/* Existing dynamic slices */}
            {chartData.map((item, index) => {
              const isActive = activeIndex === index;
              const isFaded = activeIndex !== null && !isActive;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: isChartInView ? 1 : 0,
                    y: isChartInView ? 0 : 15,
                  }}
                  transition={{
                    duration: 0.4,
                    // Shifted delay slightly so it cascades perfectly after the Total pill
                    delay: isChartInView ? 0.3 + (index + 1) * 0.1 : 0,
                    ease: "easeOut",
                  }}
                >
                  <div
                    className={`flex cursor-pointer items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 backdrop-blur-md sm:gap-2.5 ${
                      isActive ? "border-transparent" : "border-border/45"
                    }`}
                    style={{
                      opacity: isFaded ? 0.35 : 1,
                      boxShadow: isActive
                        ? `0 0 0 1px ${item.solidColor}, 0 4px 14px -2px ${item.solidColor}40`
                        : "0 0 0 0px transparent, 0px 1px 2px rgba(0, 0, 0, 0.05)",
                      transition: "all 0.15s ease-out",
                    }}
                    onMouseEnter={() => onPieEnter(null, index)}
                    onMouseLeave={onPieLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSliceTap(index);
                    }}
                  >
                    <span
                      className="h-3.5 w-1.5 shrink-0 rounded-full shadow-sm"
                      style={{ backgroundColor: item.solidColor }}
                    />
                    <span
                      className="font-medium transition-colors duration-150"
                      style={{
                        color: isActive
                          ? "hsl(var(--foreground))"
                          : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {item.name}
                    </span>
                    <span className="font-bold tabular-nums text-foreground">
                      {item.value} Qs
                    </span>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              key="total-qs"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: isChartInView ? 1 : 0,
                y: isChartInView ? 0 : 15,
              }}
              transition={{
                duration: 0.4,
                delay: isChartInView ? 0.3 : 0,
                ease: "easeOut",
              }}
            >
              <div className="flex cursor-default items-center gap-2 rounded-full border border-border/30 bg-muted/20 px-3.5 py-1.5 backdrop-blur-md sm:gap-2.5">
                <span className="h-3.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40 shadow-sm" />
                <span className="font-medium text-muted-foreground">Total</span>
                <span className="font-bold tabular-nums text-foreground">
                  {total} Qs
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
