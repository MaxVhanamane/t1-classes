// components/dashboard/RevenueTrendChart.tsx
"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useRevenueTrend } from "../hooks/use-revenue-trend";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const chartConfig = {
  gross_revenue: {
    label: "Gross Revenue",
    color: "#4f46e5", // Indigo 600
  },
  refunds: {
    label: "Refunds",
    color: "#f43f5e", // Rose 500
  },
} satisfies ChartConfig;

export function RevenueTrendChart() {
  const [months, setMonths] = useState<number>(6);
  const { data, isLoading, isError } = useRevenueTrend(months);

  if (isError) {
    return (
      <Card className="col-span-1 flex h-[400px] items-center justify-center rounded-xl border bg-card shadow-sm md:col-span-2">
        <p className="text-sm text-muted-foreground">
          Failed to load revenue data.
        </p>
      </Card>
    );
  }

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

  // Dynamically calculate the width so bars never squeeze.
  // 6 months = 500px minimum. 12 months = 960px.
  const dynamicMinWidth = Math.max(500, months * 80);

  return (
    <Card className="col-span-1 rounded-xl border bg-card shadow-none transition-all md:col-span-2">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">
            Revenue & Refunds
          </CardTitle>
          <CardDescription>
            Collection history over the last {months} months
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {!isLoading && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
                totalNetRevenue >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {totalNetRevenue >= 0 ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              Net: {formattedNetTotal}
            </div>
          )}

          <Select
            value={months.toString()}
            onValueChange={(v) => setMonths(Number(v))}
          >
            <SelectTrigger className="w-[130px] rounded-lg h-9 bg-background">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="9">Last 9 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : (
          /* Scroll wrapper */
          <div className="w-full overflow-x-auto overflow-y-hidden touch-pan-x custom-scrollbar">
            {/* Dynamic width container based on month count */}
            <div
              className="h-[300px] pr-2 text-muted-foreground"
              style={{ minWidth: `${dynamicMinWidth}px` }}
            >
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    barCategoryGap="25%"
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    {/* Grid lines using currentColor with low opacity for both light/dark support */}
                    <CartesianGrid
                      vertical={false}
                      stroke="currentColor"
                      strokeOpacity={0.15}
                      strokeDasharray="4 4"
                    />

                    {/* Using currentColor pulls the text-muted-foreground from the parent div */}
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "currentColor" }}
                      className="text-xs font-medium"
                      tickMargin={12}
                    />

                    <YAxis
                      width={65}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "currentColor" }}
                      className="text-xs font-medium"
                      tickFormatter={formatYAxis}
                      tickMargin={10}
                    />

                    {/* Hover state: Uses pure black/white depending on theme, but at 5% opacity */}
                    <ChartTooltip
                      cursor={{ fill: "var(--color-secondary)", opacity: 0.6 }}
                      content={
                        <ChartTooltipContent
                          indicator="dashed"
                          formatter={(value, name) => (
                            <>
                              {/* This keeps the text (Gross Revenue / Refunds) on the left */}
                              <span className="text-muted-foreground">
                                {name}
                              </span>

                              {/* ml-auto pushes the price to the far right, formatted with commas */}
                              <span className="ml-auto font-medium">
                                ₹{Number(value).toLocaleString("en-IN")}
                              </span>
                            </>
                          )}
                        />
                      }
                    />

                    <Bar
                      dataKey="gross_revenue"
                      name="Gross Revenue"
                      fill="var(--color-gross_revenue)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="refunds"
                      name="Refunds"
                      fill="var(--color-refunds)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
