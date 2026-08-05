"use client";

import React from "react";
import {
  Info,
  Trophy,
  Medal,
  Activity,
  BookOpen,
  PieChart,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Link } from "@/src/components/ui/link";
import { Button } from "@/src/components/ui/button";

import {
  DistributionResultRow,
  StudentSectionResult,
} from "../types/results.types";

// --- PERFORMANCE LABEL UTILS ---

const PERFORMANCE_LABELS: Record<string, { text: string; color: string }> = {
  perfect: {
    text: "Perfect",
    color:
      "text-yellow-600 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20",
  },
  outstanding: {
    text: "Outstanding",
    color:
      "text-purple-600 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
  },
  excellent: {
    text: "Excellent",
    color:
      "text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  },
  very_good: {
    text: "Very Good",
    color:
      "text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  },
  good: {
    text: "Good",
    color:
      "text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
  },
  average: {
    text: "Average",
    color:
      "text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-500/10 dark:border-gray-500/20",
  },
  needs_improvement: {
    text: "Needs Improvement",
    color:
      "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  },
};

function getPerformanceKeyFromPercentage(percentage: number): string {
  if (percentage >= 100) return "perfect";
  if (percentage >= 90) return "outstanding";
  if (percentage >= 80) return "excellent";
  if (percentage >= 75) return "very_good";
  if (percentage >= 60) return "good";
  if (percentage >= 40) return "average";
  return "needs_improvement";
}

// --- HELPER FORMATTERS ---

function formatTime(seconds: number) {
  if (!seconds && seconds !== 0) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatTimeOfDay(dateString: string | null) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="text-muted-foreground">—</span>;
  if (rank === 1)
    return (
      <Badge className="bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600 border-none gap-1 pr-2.5">
        <Trophy className="h-3 w-3" /> 1st
      </Badge>
    );
  if (rank === 2)
    return (
      <Badge className="bg-slate-300 text-slate-800 hover:bg-slate-400 border-none gap-1 pr-2.5 dark:bg-slate-200">
        <Medal className="h-3 w-3" /> 2nd
      </Badge>
    );
  if (rank === 3)
    return (
      <Badge className="bg-orange-300 text-orange-950 hover:bg-orange-400 border-none gap-1 pr-2.5 dark:bg-orange-200">
        <Medal className="h-3 w-3" /> 3rd
      </Badge>
    );
  return <span className="font-medium text-muted-foreground">#{rank}</span>;
}

interface Props {
  items: DistributionResultRow[];
  isFetching?: boolean;
  batchId?: string;
  isSummaryLoading?: boolean;
}

export function ResultsTable({
  items,
  isFetching = false,
  batchId,
  isSummaryLoading = false,
}: Props) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm bg-card py-0">
      <div
        className={
          isFetching ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="sticky left-0 z-20 w-16 bg-secondary text-center font-semibold text-foreground border-r border-border/50">
                  No.
                </TableHead>
                <TableHead className="font-semibold text-foreground min-w-[180px]">
                  Student
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Rank
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Score
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Percentage
                </TableHead>
                <TableHead className="font-semibold text-foreground min-w-[120px]">
                  Remark
                </TableHead>
                {/* NEW BREAKDOWN COLUMN */}
                <TableHead className="font-semibold text-foreground min-w-[130px]">
                  Breakdown
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground min-w-[120px]">
                    Percentile
                    <RichPopover
                      color="purple"
                      title="Class Percentile"
                      description="Indicates how this student's score compares to the rest of the batch."
                      trigger={
                        <Info className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
                      }
                    />
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  Correct
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  Wrong
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  Partial
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  Unattempted
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground min-w-[150px] pl-0.5">
                    Completion
                    <RichPopover
                      color="cyan"
                      title="Completion Rate"
                      description="The percentage of questions the student actually attempted."
                      trigger={
                        <Info className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
                      }
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground min-w-[140px]">
                    Time (Active)
                    <RichPopover
                      color="yellow"
                      title="Engagement Time"
                      description="Time spent specifically on questions the student answered."
                      trigger={
                        <Info className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
                      }
                    />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground min-w-[120px]">
                  Evaluated
                </TableHead>
                <TableHead className="sticky right-0 z-20 w-16 bg-secondary text-center font-medium shadow-[inset_1px_0_0_0_var(--border-50)]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((row, index) => {
                const percentage =
                  row.total_marks > 0
                    ? Number(
                        ((row.obtained_marks / row.total_marks) * 100).toFixed(
                          1,
                        ),
                      )
                    : 0;

                const attemptedQs =
                  row.correct_count +
                  row.partial_correct_count +
                  row.wrong_count;
                const totalQs = attemptedQs + row.unanswered_count;
                const activeTime =
                  row.active_time_seconds ?? row.time_spent_seconds;
                const evalDate = row.evaluated_at || row.submitted_at;

                // Group sections for the Popover
                const hasSections =
                  row.sectionResults && row.sectionResults.length > 0;
                const groupedSections = hasSections
                  ? row.sectionResults.reduce(
                      (acc, sec) => {
                        if (!acc[sec.subjectLabel]) acc[sec.subjectLabel] = [];
                        acc[sec.subjectLabel].push(sec);
                        return acc;
                      },
                      {} as Record<string, StudentSectionResult[]>,
                    )
                  : {};

                return (
                  <TableRow
                    key={row.id}
                    className="group transition-colors hover:bg-muted-subtle"
                  >
                    {/* Sticky Number Column */}
                    <TableCell className="sticky left-0 z-20 w-16 min-w-16 bg-card text-center font-semibold text-muted-foreground transition-colors group-hover:bg-muted-subtle border-r border-border/50">
                      {index + 1}
                    </TableCell>

                    {/* Student Info */}
                    <TableCell className="max-w-52">
                      <div
                        className="truncate font-semibold text-foreground"
                        title={row.student_name}
                      >
                        {row.student_name}
                      </div>
                      {row.student_email && (
                        <div
                          className="truncate text-xs text-muted-foreground mt-0.5"
                          title={row.student_email}
                        >
                          {row.student_email}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <RankBadge rank={row.rank} />
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-foreground">
                        {row.obtained_marks}{" "}
                        <span className="text-muted-foreground font-medium text-xs">
                          / {row.total_marks}
                        </span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="px-1.5 rounded-sm font-bold"
                      >
                        {percentage}%
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {row.performance_label ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 rounded-sm border-indigo-200 text-indigo-700 bg-indigo-50/50 dark:border-indigo-500/30 dark:text-indigo-400 dark:bg-indigo-500/10 uppercase tracking-wider"
                        >
                          {row.performance_label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* POPOVER BREAKDOWN CELL */}
                    <TableCell>
                      {hasSections ? (
                        <RichPopover
                          color="purple"
                          title="Subject Breakdown"
                          className="w-80 p-4"
                          icon={<PieChart className="h-4 w-4" />}
                          trigger={
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/70 transition-colors flex items-center gap-1.5 w-fit font-medium border-border/50"
                            >
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              View
                            </Badge>
                          }
                        >
                          {/* 
                            DYNAMIC HEIGHT LOGIC: 
                            Shrink-wraps small tests (1 subject, <=2 sections) to avoid empty space. 
                            Uses a fixed h-56 for large multi-subject tests to enable clean scrolling. 
                          */}
                          <ScrollArea
                            className={`mt-4 pr-4 -mr-4 [&>[data-radix-scroll-area-viewport]]:max-h-[inherit] ${
                              Object.keys(groupedSections).length === 1 &&
                              row.sectionResults.length === 1
                                ? "h-auto max-h-32"
                                : Object.keys(groupedSections).length === 1 &&
                                    row.sectionResults.length <= 2
                                  ? "h-auto max-h-36"
                                  : "h-46"
                            }`}
                          >
                            <div className="flex flex-col gap-3 pb-2">
                              {Object.entries(groupedSections).map(
                                ([subject, sections]) => {
                                  const subjectObtained = sections.reduce(
                                    (sum, s) => sum + s.obtainedMarks,
                                    0,
                                  );
                                  const subjectTotal = sections.reduce(
                                    (sum, s) => sum + s.totalMarks,
                                    0,
                                  );
                                  const subjectPct =
                                    subjectTotal > 0
                                      ? (subjectObtained / subjectTotal) * 100
                                      : 0;

                                  const performanceKey =
                                    getPerformanceKeyFromPercentage(subjectPct);
                                  const labelMeta =
                                    PERFORMANCE_LABELS[performanceKey];

                                  return (
                                    <div
                                      key={subject}
                                      className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3"
                                    >
                                      {/* --- REFINED HEADER LAYOUT --- */}
                                      <div className="flex flex-col gap-1.5 border-b border-border/50 pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="font-semibold text-foreground text-sm leading-tight">
                                            {subject}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={`shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0 border ${labelMeta.color}`}
                                          >
                                            {labelMeta.text}
                                          </Badge>
                                        </div>
                                        <div className="flex items-end justify-between mt-1">
                                          <span className="font-semibold text-muted-foreground text-[10px]">
                                            {subjectPct.toFixed(1)}%
                                          </span>
                                          <span className="font-bold text-foreground text-sm">
                                            {subjectObtained}{" "}
                                            <span className="font-medium text-muted-foreground text-xs">
                                              / {subjectTotal}
                                            </span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* --- INNER SECTIONS BREAKDOWN --- */}
                                      {sections.length > 0 && (
                                        <div className="flex flex-col gap-1.5 pt-0.5">
                                          {sections.map((sec) => (
                                            <div
                                              key={sec.sectionId}
                                              className="flex items-center justify-between text-[11px]"
                                            >
                                              <span
                                                className="truncate text-muted-foreground pr-2"
                                                title={sec.sectionTitle}
                                              >
                                                {sec.sectionTitle}
                                              </span>
                                              <span className="shrink-0 font-medium text-foreground">
                                                {sec.obtainedMarks}{" "}
                                                <span className="text-muted-foreground font-normal">
                                                  / {sec.totalMarks}
                                                </span>
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </ScrollArea>
                        </RichPopover>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.percentile !== null ? (
                        <span className="font-medium text-foreground">
                          {row.percentile.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-medium text-foreground">
                      {row.correct_count}
                    </TableCell>
                    <TableCell className="text-center font-medium text-foreground">
                      {row.wrong_count}
                    </TableCell>
                    <TableCell className="text-center font-medium text-foreground">
                      {row.partial_correct_count}
                    </TableCell>
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {row.unanswered_count}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1.5 min-w-[130px] pl-0.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="font-bold text-foreground">
                            {row.completion_percentage}%
                          </span>
                          <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md font-mono">
                            {attemptedQs}/{totalQs} Qs
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${row.completion_percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm">
                          {formatTime(activeTime)}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                          Total: {formatTime(row.time_spent_seconds)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm">
                          {formatDate(evalDate)}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {formatTimeOfDay(evalDate)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="sticky right-0 z-20 text-center bg-card font-semibold transition-colors group-hover:bg-muted-subtle shadow-[inset_1px_0_0_0_var(--border-50)]">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {isSummaryLoading || !batchId ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="h-8 w-8 opacity-50 cursor-not-allowed"
                              >
                                <Activity className="h-4 w-4 animate-pulse text-muted-foreground" />
                              </Button>
                            ) : (
                              <Link
                                href={`/admin/students/${row.user_id}/batches/${batchId}/performance`}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10"
                                >
                                  <Activity className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {isSummaryLoading
                              ? "Loading batch info..."
                              : "View Analytics"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}

ResultsTable.Skeleton = function ResultsTableSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm bg-card py-0">
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="sticky left-0 z-20 w-16 bg-secondary text-center border-r border-border/50">
                No.
              </TableHead>
              <TableHead className="min-w-[180px]">Student</TableHead>
              <TableHead className="min-w-[80px]">Rank</TableHead>
              <TableHead className="min-w-[80px]">Score</TableHead>
              <TableHead className="min-w-[90px]">Percentage</TableHead>
              <TableHead className="min-w-[120px]">Remark</TableHead>
              {/* Skeleton column for Breakdown */}
              <TableHead className="min-w-[130px]">Breakdown</TableHead>
              <TableHead className="min-w-[120px]">Percentile</TableHead>
              <TableHead className="text-center min-w-[70px]">
                Correct
              </TableHead>
              <TableHead className="text-center min-w-[70px]">Wrong</TableHead>
              <TableHead className="text-center min-w-[70px]">
                Partial
              </TableHead>
              <TableHead className="text-center min-w-[90px]">
                Unattempted
              </TableHead>
              <TableHead className="min-w-[150px]">Completion</TableHead>
              <TableHead className="min-w-[140px]">Time (Active)</TableHead>
              <TableHead className="min-w-[120px]">Evaluated</TableHead>
              <TableHead className="sticky right-0 z-20 w-16 bg-secondary text-center font-medium shadow-[inset_1px_0_0_0_var(--border-50)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="sticky left-0 z-20 w-16 bg-card text-center border-r border-border/50">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="min-w-[180px] max-w-52">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </TableCell>
                <TableCell className="min-w-[80px]">
                  <Skeleton className="h-6 w-10 rounded-md" />
                </TableCell>
                <TableCell className="min-w-[80px]">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="min-w-[90px]">
                  <Skeleton className="h-5 w-12 rounded-sm" />
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <Skeleton className="h-5 w-16 rounded-sm" />
                </TableCell>
                {/* Skeleton cell for Breakdown */}
                <TableCell className="min-w-[130px]">
                  <Skeleton className="h-6 w-16 rounded-md" />
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell className="text-center min-w-[70px]">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="text-center min-w-[70px]">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="text-center min-w-[70px]">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="text-center min-w-[90px]">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="min-w-[150px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="min-w-[140px]">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                </TableCell>
                <TableCell className="sticky right-0 z-20 flex items-center justify-center bg-card font-semibold transition-colors group-hover:bg-muted-subtle shadow-[inset_1px_0_0_0_var(--border-50)]">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
