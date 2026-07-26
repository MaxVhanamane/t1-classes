"use client";

import { useState } from "react";
import {
  Plus,
  TrendingUp,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

import type { SyllabusBatchMetadata } from "../types/syllabus-progress.types";
import DottedBackground from "@/src/components/dotted-background";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { CountUpNumber } from "@/src/app/student/tests/results/[attemptId]/_features/components/count-up-number";

interface DashboardStatsCardProps {
  batchMeta: SyllabusBatchMetadata | undefined;
  totalChapters: number;
  completedChapters: number;
  verifiedChapters: number;
  overallPercent: number;
  isAdmin: boolean;
  onAddSection: () => void;
}

export function DashboardStatsCard({
  batchMeta,
  totalChapters,
  completedChapters,
  verifiedChapters,
  overallPercent,
  isAdmin,
  onAddSection,
}: DashboardStatsCardProps) {
  // Fixes the "impure function" error by locking the render time in state
  const [now] = useState(() => Date.now());

  let pacingBadge = null;
  let projectedDate = null;
  let pacingExplanation = "";
  let projectionExplanation = "";

  const startDateStr = batchMeta?.start_date;
  const endDateStr = batchMeta?.end_date;

  // NEW: Global Verified Math
  const verifiedPercent =
    totalChapters > 0
      ? Math.round((verifiedChapters / totalChapters) * 100)
      : 0;
  const pendingVerification = completedChapters - verifiedChapters;

  // Formatting helper for readable dates inside text
  const formatShortDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  /* ---------- Velocity & Tolerance Math ---------- */
  if (startDateStr && endDateStr && totalChapters > 0) {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();

    // 1. Calculate time passed (Batch Timeline vs. Today)
    const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
    const timeElapsedPercent = Math.min(
      100,
      Math.round((elapsedDays / totalDays) * 100),
    );

    // 2. Tolerance Math (±5% buffer)
    const diff = overallPercent - timeElapsedPercent;
    const deficit = Math.abs(diff);

    if (elapsedDays > 0) {
      let statusText = "";

      if (diff < -10) {
        pacingBadge = (
          <Badge
            variant="secondary"
            className="border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 gap-1 cursor-pointer transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/25 shadow-sm"
          >
            <AlertCircle className="size-3" /> Significantly Behind
          </Badge>
        );
        statusText = `Severely behind schedule. You have used up ${timeElapsedPercent}% of the batch time, but only finished ${overallPercent}% of the chapters.`;
      } else if (diff < -5) {
        pacingBadge = (
          <Badge
            variant="secondary"
            className="border bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 gap-1 cursor-pointer transition-colors hover:bg-amber-100 dark:hover:bg-amber-500/25 shadow-sm"
          >
            <AlertCircle className="size-3" /> Slightly Behind
          </Badge>
        );
        statusText = `Falling behind. You are trailing the expected pace by about ${deficit}%.`;
      } else if (diff > 5) {
        pacingBadge = (
          <Badge
            variant="secondary"
            className="border bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 gap-1 cursor-pointer transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-500/25 shadow-sm"
          >
            <TrendingUp className="size-3" /> Ahead of Schedule
          </Badge>
        );
        statusText = `Ahead of schedule! You have completed ${overallPercent}% of the work while only ${timeElapsedPercent}% of the time has passed.`;
      } else {
        pacingBadge = (
          <Badge
            variant="secondary"
            className="border bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30 gap-1 cursor-pointer transition-colors hover:bg-sky-100 dark:hover:bg-sky-500/25 shadow-sm"
          >
            <CheckCircle2 className="size-3" /> On Track
          </Badge>
        );
        statusText =
          "On Track. Your progress is perfectly matching the expected timeline.";
      }
      // 3. Clean, conversational string (no dashes or bullets)
      pacingExplanation = `The batch runs for ${Math.floor(totalDays)} days, from ${formatShortDate(startDateStr)} to ${formatShortDate(endDateStr)}. So far, ${Math.floor(elapsedDays)} days have passed, meaning ${timeElapsedPercent}% of the time is gone. Meanwhile, ${completedChapters} out of ${totalChapters} chapters are done, which is ${overallPercent}% of the syllabus.\n\nResult: ${statusText}`;

      // 4. Projected End Date (Current Velocity)
      if (completedChapters > 0) {
        const pacePerDay = completedChapters / elapsedDays;
        const remainingChapters = totalChapters - completedChapters;
        const remainingDays = remainingChapters / pacePerDay;

        const projDate = new Date(now + remainingDays * 24 * 60 * 60 * 1000);
        projectedDate = projDate.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        projectionExplanation = `At your current speed of ${pacePerDay.toFixed(2)} chapters per day, it will take about ${Math.ceil(remainingDays)} more days to finish the last ${remainingChapters} chapters.`;
      }
    }
  }

  return (
    <Card className="bg-card border-border/60 overflow-hidden rounded-xl shadow-none py-0">
      {/* Grid Layout: Stacks cleanly on mobile, splits 2:1 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
        {/* Left Side: Core Progress (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-center bg-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Batch Progress
            </h2>

            {/* Pacing Badge with Math Explanation Popover */}
            {pacingBadge && (
              <RichPopover
                color="red"
                sideOffset={12}
                trigger={pacingBadge}
                title="How is this calculated?"
                icon={<Info className="size-5" strokeWidth={2.5} />}
                description={pacingExplanation}
              />
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground leading-none">
              <CountUpNumber start value={overallPercent} />%
            </span>
            <span className="text-base font-medium text-muted-foreground pb-1">
              ({completedChapters} of {totalChapters} chapters)
            </span>
          </div>

          <div className="w-full h-2 bg-secondary/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          {/* NEW: Verified Metric UI directly under the progress bar */}
          {totalChapters > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="size-4" />
                <span>
                  {verifiedPercent}% Verified{" "}
                  <span className="text-muted-foreground font-normal ml-0.5">
                    ({verifiedChapters} total)
                  </span>
                </span>
              </div>

              {/* Alert Admins if there are chapters waiting for verification */}
              {isAdmin && pendingVerification > 0 && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20 shadow-sm">
                  <ShieldAlert className="size-3.5" />
                  <span>{pendingVerification} pending verification</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Meta Information & Actions */}
        <div className="p-6 md:p-8 flex flex-col justify-between gap-8 bg-muted/20">
          <div className="space-y-6">
            {/* Batch Timeline (Pure Text, NO button styling) */}
            {startDateStr && endDateStr && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Batch Timeline
                </div>
                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <span>{formatShortDate(startDateStr)}</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    to
                  </span>
                  <span>{formatShortDate(endDateStr)}</span>
                </div>
              </div>
            )}

            {/* Projected Date with Shadcn Secondary Button */}
            {projectedDate && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  Est. Completion
                </div>
                <RichPopover
                  sideOffset={12}
                  trigger={
                    <Button
                      variant="secondary"
                      className="w-full sm:w-fit flex items-center justify-between gap-4 h-9 px-3 group"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="font-semibold text-foreground">
                          {projectedDate}
                        </span>
                      </div>
                      <Info className="size-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </Button>
                  }
                  badgeText="Projection"
                  metaText={projectedDate}
                  title="Velocity Projection"
                  icon={<TrendingUp className="size-5" strokeWidth={2.5} />}
                  description={projectionExplanation}
                  color="pink"
                >
                  <DottedBackground className="opacity-40" />
                </RichPopover>
              </div>
            )}
          </div>

          {/* Admin Action */}
          {isAdmin && (
            <Button
              onClick={onAddSection}
              className="w-full h-10 shadow-none mt-2"
            >
              <Plus className="size-4 mr-2" /> Add Section
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
