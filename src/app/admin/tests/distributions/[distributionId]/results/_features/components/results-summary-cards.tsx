"use client";

import { useMemo } from "react";
import { Target, Trophy, Users2 } from "lucide-react";
import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  DistributionResultsSummary,
  SectionDetail,
} from "../types/results.types";
import { CardGlow, type GlowColor } from "@/src/components/ui/common/card-glow";

// Assuming these are imported elsewhere in your actual file
// import { ScoreBar } from "...";
// import { formatAnswerMode } from "...";

interface Props {
  summary?: DistributionResultsSummary;
  isLoading?: boolean;
}

const GLOW_COLORS: GlowColor[] = [
  "cyan",
  "emerald",
  "yellow",
  "pink",
  "purple",
  "indigo",
  "teal",
  "gray",
  "blue",
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "sky",
  "violet",
  "fuchsia",
  "rose",
];

// Tailwind needs complete class names to prevent them from being purged
const COLOR_CLASSES: Record<GlowColor, { bar: string; tint: string }> = {
  cyan: { bar: "bg-cyan-500", tint: "bg-cyan-50/80 dark:bg-cyan-500/10" },
  emerald: {
    bar: "bg-emerald-500",
    tint: "bg-emerald-50/80 dark:bg-emerald-500/10",
  },
  yellow: {
    bar: "bg-yellow-500",
    tint: "bg-yellow-50/80 dark:bg-yellow-500/10",
  },
  pink: { bar: "bg-pink-500", tint: "bg-pink-50/80 dark:bg-pink-500/10" },
  purple: {
    bar: "bg-purple-500",
    tint: "bg-purple-50/80 dark:bg-purple-500/10",
  },
  indigo: {
    bar: "bg-indigo-500",
    tint: "bg-indigo-50/80 dark:bg-indigo-500/10",
  },
  teal: { bar: "bg-teal-500", tint: "bg-teal-50/80 dark:bg-teal-500/10" },
  gray: { bar: "bg-gray-500", tint: "bg-gray-50/80 dark:bg-gray-500/10" },
  blue: { bar: "bg-blue-500", tint: "bg-blue-50/80 dark:bg-blue-500/10" },
  red: { bar: "bg-red-500", tint: "bg-red-50/80 dark:bg-red-500/10" },
  orange: {
    bar: "bg-orange-500",
    tint: "bg-orange-50/80 dark:bg-orange-500/10",
  },
  amber: { bar: "bg-amber-500", tint: "bg-amber-50/80 dark:bg-amber-500/10" },
  lime: { bar: "bg-lime-500", tint: "bg-lime-50/80 dark:bg-lime-500/10" },
  green: { bar: "bg-green-500", tint: "bg-green-50/80 dark:bg-green-500/10" },
  sky: { bar: "bg-sky-500", tint: "bg-sky-50/80 dark:bg-sky-500/10" },
  violet: {
    bar: "bg-violet-500",
    tint: "bg-violet-50/80 dark:bg-violet-500/10",
  },
  fuchsia: {
    bar: "bg-fuchsia-500",
    tint: "bg-fuchsia-50/80 dark:bg-fuchsia-500/10",
  },
  rose: { bar: "bg-rose-500", tint: "bg-rose-50/80 dark:bg-rose-500/10" },
};

function getSubjectColor(subject: string): GlowColor {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GLOW_COLORS[Math.abs(hash) % GLOW_COLORS.length];
}

export function ResultsSummaryCards({ summary, isLoading = false }: Props) {
  const sections = summary?.sections;

  const groupedSections = useMemo(() => {
    if (!sections) return {};
    return sections.reduce(
      (acc, section) => {
        const subject = section.subjectLabel || "Uncategorized";
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(section);
        return acc;
      },
      {} as Record<string, SectionDetail[]>,
    );
  }, [sections]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Hero Skeleton */}
        <Card className="grid grid-cols-1 divide-y divide-border/70 overflow-hidden rounded-xl border-border/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0 py-0">
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-14 shrink-0" />
              <Skeleton className="h-2 min-w-0 flex-1 rounded-full" />
              <Skeleton className="h-4 w-10 shrink-0" />
            </div>
            <div className="flex items-center gap-3 pt-0.5">
              <Skeleton className="h-3 w-14 shrink-0" />
              <Skeleton className="h-2 min-w-0 flex-1 rounded-full" />
              <Skeleton className="h-4 w-10 shrink-0" />
            </div>
          </div>
        </Card>

        {/* Subject Cards Skeleton */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="flex h-46 flex-col overflow-hidden rounded-xl border-border/70 py-0 gap-2"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-3.5 py-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="divide-y divide-border/70">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="flex items-start justify-between gap-3 px-3.5 py-2.5"
                    >
                      <div className="flex flex-col gap-1.5 w-full">
                        <Skeleton className="h-3.5 w-[85%]" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                      <Skeleton className="h-3 w-16 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const {
    participants,
    submitted,
    inProgress,
    expired,
    averageScore,
    topScore,
    totalMarks,
  } = summary;

  const participationTotal = Math.max(
    participants,
    submitted + inProgress + expired,
    1,
  );

  const segments = [
    { label: "Submitted", value: submitted, color: "bg-emerald-500" },
    { label: "In Progress", value: inProgress, color: "bg-amber-500" },
    { label: "Expired", value: expired, color: "bg-rose-400" },
  ];

  const avgPct =
    totalMarks > 0 && averageScore !== null
      ? (averageScore / totalMarks) * 100
      : 0;
  const topPct =
    totalMarks > 0 && topScore !== null ? (topScore / totalMarks) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* HERO OVERVIEW */}
      <Card className="grid grid-cols-1 divide-y divide-border/70 overflow-hidden rounded-xl border-border/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0 py-0">
        {/* Participation */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users2 className="h-3.5 w-3.5" strokeWidth={2} />
              Total Participants
            </div>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {participants}
            </span>
          </div>

          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {segments.map((seg) =>
              seg.value > 0 ? (
                <div
                  key={seg.label}
                  className={seg.color}
                  style={{
                    width: `${(seg.value / participationTotal) * 100}%`,
                  }}
                />
              ) : null,
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {segments.map((seg) => (
              <div
                key={seg.label}
                className="flex items-center gap-1.5 text-xs"
              >
                <span className={`h-2 w-2 rounded-full ${seg.color}`} />
                <span className="text-muted-foreground">{seg.label}</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {seg.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Target className="h-3.5 w-3.5" strokeWidth={2} />
              Score
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              out of {totalMarks}
            </span>
          </div>

          <ScoreBar
            label="Average"
            value={averageScore}
            pct={avgPct}
            barClassName="bg-blue-500"
          />
          <ScoreBar
            label="Top"
            value={topScore}
            pct={topPct}
            barClassName="bg-emerald-500"
            icon={
              <Trophy
                className="h-3 w-3 text-emerald-600 dark:text-emerald-500"
                strokeWidth={2.5}
              />
            }
          />
        </div>
      </Card>

      {/* SUBJECT BREAKDOWN */}
      {Object.keys(groupedSections).length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedSections).map(([subject, secList]) => {
            const color = getSubjectColor(subject);
            const accentClasses = COLOR_CLASSES[color];

            const subjectMarks = secList.reduce(
              (sum, sec) => sum + sec.sectionTotalMarks,
              0,
            );
            const subjectQuestions = secList.reduce(
              (sum, sec) => sum + sec.sectionTotalQuestions,
              0,
            );

            return (
              <Card
                key={subject}
                className="flex h-46 flex-col overflow-hidden rounded-xl border-border/70 py-0 gap-2 relative"
              >
                <CardGlow
                  color={color}
                  className="rounded-tr-xl rounded-tl-xl"
                  hideLightGlow
                />
                {/* Header (Sticky/Fixed) */}
                <div
                  className={`flex shrink-0 items-center justify-between border-b border-border/70 px-3.5 py-2 ${accentClasses.tint}`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${accentClasses.bar}`}
                    />
                    <span
                      className="truncate text-sm font-bold capitalize"
                      title={subject}
                    >
                      {subject}
                    </span>
                  </div>
                  <span className="shrink-0 pl-2 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {subjectQuestions} Qs · {subjectMarks} Marks
                  </span>
                </div>

                {/* Body (Scrollable with min-h-0 fix and proper text wrapping) */}
                <ScrollArea className="flex-1 min-h-0 ">
                  <div className="divide-y divide-border/70">
                    {secList.map((sec) => (
                      <div
                        key={sec.sectionId}
                        className="flex items-start justify-between gap-3 px-3.5 py-2.5 text-sm"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="font-medium text-xs leading-snug text-foreground wrap-break-word line-clamp-2">
                            {sec.sectionTitle}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {formatAnswerMode(sec.answerMode)}
                          </span>
                        </div>
                        <div className="shrink-0 whitespace-nowrap text-right text-[11px] font-medium tabular-nums text-muted-foreground mt-0.5">
                          {sec.sectionTotalQuestions} Qs ·{" "}
                          {sec.sectionTotalMarks} Marks
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  pct,
  barClassName,
  icon,
}: {
  label: string;
  value: number | null;
  pct: number;
  barClassName: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span className="flex w-14 shrink-0 items-center justify-end gap-1 text-sm font-semibold tabular-nums text-foreground">
        {icon}
        {value !== null ? value.toFixed(2) : "—"}
      </span>
    </div>
  );
}

function formatAnswerMode(mode: string) {
  return mode
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
