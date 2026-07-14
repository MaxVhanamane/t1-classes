// components/dashboard/EnrollmentDonutChart.tsx
"use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/src/components/ui/chart";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useEnrollmentDistribution } from "../hooks/use-enrollment-distribution";

// Fixed hues using Tailwind 500-level shades.
// These stay consistent across themes but maintain contrast on both light/dark backgrounds.
const COLORS = [
  "#3b82f6", // Blue 500
  "#10b981", // Emerald 500
  "#f97316", // Orange 500
  "#f43f5e", // Rose 500
  "#a855f7", // Purple 500
];

export function EnrollmentDonutChart({
  type,
}: {
  type: "courses" | "batches";
}) {
  const { data, isLoading, isError } = useEnrollmentDistribution();

  if (isLoading) {
    return (
      <Card className="rounded-xl border bg-card shadow-sm h-full flex flex-col">
        <CardHeader>
          <Skeleton className="mb-2 h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="flex-1 flex justify-center items-center h-[300px]">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="flex h-full min-h-[400px] items-center justify-center rounded-xl border bg-card shadow-sm">
        <p className="text-sm text-muted-foreground">
          Failed to load enrollments.
        </p>
      </Card>
    );
  }

  const activeData = data[type];
  const totalStudents = activeData.reduce(
    (acc, curr) => acc + curr.students,
    0,
  );

  const title = type === "courses" ? "Top Courses" : "Top Batches";
  const description =
    type === "courses"
      ? "Active students in your top 5 courses"
      : "Active students in your top 5 batches";

  // Assign the fixed colors to the data
  const chartData = activeData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = activeData.reduce(
    (acc, curr, index) => {
      const safeKey = `item_${index}`;
      acc[safeKey] = {
        label: curr.name,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <Card className="rounded-xl border bg-card shadow-none transition-all flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {activeData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
            No active {type} found.
          </div>
        ) : (
          <>
            <div className="h-[220px] w-full relative mb-6 mt-2">
              {/* Z-index trick to keep the center text strictly behind the chart hover tooltip */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {totalStudents}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">
                  Total
                </span>
              </div>

              <ChartContainer
                config={chartConfig}
                className="h-full w-full relative z-10"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip
                      cursor={{ fill: "currentColor", opacity: 0.05 }}
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          className="bg-background border-border shadow-xl min-w-[200px] z-50"
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-4">
                              <span className="text-muted-foreground truncate max-w-[150px] font-medium">
                                {name}
                              </span>
                              <span className="font-bold text-foreground">
                                {value} students
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey="students"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      strokeWidth={3}
                      stroke="var(--color-card)"
                      paddingAngle={3}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* STATIC LEGEND WITH SHADCN TOOLTIPS */}
            <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-border/50">
              <TooltipProvider delayDuration={300}>
                {chartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm group pt-2"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: item.fill }}
                      />

                      {/* Shadcn Tooltip wrapping the truncated text */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[200px] font-medium text-foreground group-hover:text-primary transition-colors cursor-default">
                            {item.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p>{item.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-muted-foreground flex-shrink-0 font-medium bg-muted/40 px-2.5 py-1 rounded-md text-xs">
                      {item.students} students
                    </span>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
