// components/dashboard/BatchHealthTable.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useBatchHealth } from "../hooks/use-batch-health";
import { Users, IndianRupee, Activity } from "lucide-react";

export function BatchHealthTable() {
  const { data, isLoading, isError } = useBatchHealth();

  if (isLoading) {
    return (
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardHeader>
          <Skeleton className="mb-2 h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="flex h-[300px] items-center justify-center rounded-xl border bg-card shadow-sm">
        <p className="text-sm text-muted-foreground">
          Failed to load batch data.
        </p>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Premium "Linear-style" Status Badges
  // Uses a solid dot and a subtle border/text color for a high-end look in both modes.
  const getHealthBadge = (students: number) => {
    if (students >= 50) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_1px_rgba(16,185,129,0.4)]" />
          High Demand
        </Badge>
      );
    }
    if (students >= 20) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_1px_rgba(59,130,246,0.4)]" />
          Healthy
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400 font-medium"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_1px_rgba(245,158,11,0.4)]" />
        Growing
      </Badge>
    );
  };

  return (
    <Card className="rounded-xl border bg-card shadow-none transition-all overflow-hidden pt-0">
      <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold tracking-tight">
            Batch Health Tracker
          </CardTitle>
        </div>
        <CardDescription>
          Performance and revenue overview of your top active batches
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            No active batches found.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <TooltipProvider delayDuration={300}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/10">
                    <TableHead className="w-[25%] pl-6">Batch Name</TableHead>
                    <TableHead className="w-[30%]">Attached Courses</TableHead>
                    <TableHead className="text-center w-[15%]">
                      Status
                    </TableHead>
                    <TableHead className="text-center w-[15%]">
                      <div className="flex items-center justify-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        Students
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[15%] pr-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                        Revenue
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((batch) => (
                    <TableRow
                      key={batch.id}
                      className="group transition-colors"
                    >
                      {/* BATCH NAME WITH TOOLTIP */}
                      <TableCell className="font-medium pl-6">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[180px] truncate cursor-default">
                              {batch.batch_name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{batch.batch_name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* COURSE NAME(S) WITH TOOLTIP */}
                      <TableCell className="text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[220px] truncate cursor-default">
                              {batch.course_name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[300px]">
                            <p>{batch.course_name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* STATUS BADGE */}
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {getHealthBadge(batch.active_students)}
                        </div>
                      </TableCell>

                      {/* ACTIVE STUDENTS - CENTERED */}
                      <TableCell className="text-center">
                        <span className="font-semibold text-foreground/80">
                          {batch.active_students}
                        </span>
                      </TableCell>

                      {/* TOTAL REVENUE - CENTERED */}
                      <TableCell className="text-center pr-6 font-semibold text-foreground group-hover:text-primary transition-colors">
                        {formatCurrency(batch.total_revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
