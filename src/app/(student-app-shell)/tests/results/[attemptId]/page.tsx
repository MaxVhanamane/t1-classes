"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Trophy,
  CheckCircle2,
  Percent,
  Medal,
  CalendarDays,
  Target,
  AlertCircle,
  XCircle,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { StatCard } from "./_features/components/stat-card";
import { LoadingState } from "./_features/components/loading";
import { useResultSummary } from "./_features/hooks/use-result-summary";
import { CountUpNumber } from "./_features/components/count-up-number";
import { ApiErrorState } from "@/src/components/ui/ApiErrorState";
import { PendingResultState } from "./_features/components/pending-state";

import { useMyRank } from "./_features/hooks/use-my-rank";
import { useRotatingMessage } from "@/src/hooks/use-rotating-message";

/* -------------------------------------------------- */

type SummaryCache = {
  kind: "submitted";
  obtainedMarks: number;
  totalMarks: number;
  correctCount: number;
  partialCorrectCount: number;
  wrongCount: number;
  unansweredCount: number;
  submittedAt: string;
  percentage: number;
};

/* -------------------------------------------------- */

const rankLoadingMessages = [
  "Calculating your rank among all students…",
  "Comparing scores across participants…",
  "Preparing leaderboard standings…",
  "Finalizing your position…",
];

const performanceBarStyles: Record<string, string> = {
  Perfect: "bg-emerald-500",
  Excellent: "bg-green-500",
  Good: "bg-blue-500",
  Average: "bg-amber-500",
  "Needs Improvement": "bg-red-500",
};

const performanceTextStyles: Record<string, string> = {
  Perfect: "text-emerald-600",
  Excellent: "text-green-600",
  Good: "text-blue-600",
  Average: "text-amber-600",
  "Needs Improvement": "text-red-600",
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/* -------------------------------------------------- */

export default function ResultsOverview() {
  const { attemptId } = useParams<{ attemptId: string }>();

  const queryClient = useQueryClient();

  const summary = queryClient.getQueryData<SummaryCache>([
    "result-summary",
    attemptId,
  ]);

  const { data, error, isLoading, isError, refetch } =
    useResultSummary(attemptId);

  /* -------------------------------------------------- */
  /* Source resolution                                  */
  /* -------------------------------------------------- */

  const hasValidData = data && data.kind === "ok";

  const hasValidSummary = summary && summary.kind === "submitted";

  const source = hasValidData ? data : hasValidSummary ? summary : null;

  /* -------------------------------------------------- */
  /* Rank fallback logic                                */
  /* -------------------------------------------------- */

  const summaryRank = source && "rank" in source ? source.rank : null;
  const summaryTotalParticipants =
    source && "totalParticipants" in source ? source.totalParticipants : null;
  const summaryPerformanceLabel =
    source && "performanceLabel" in source ? source.performanceLabel : null;

  const distributionId =
    source && "distributionId" in source ? source.distributionId : null;

  const shouldFetchRank = Boolean(distributionId) && summaryRank === null;

  /* Always call hooks */

  const {
    data: rankData,
    isLoading: isRankLoading,
    isError: isRankError,
  } = useMyRank(distributionId ?? "", shouldFetchRank);

  const rotatingMessage = useRotatingMessage(rankLoadingMessages);

  /* -------------------------------------------------- */
  /* Guards                                             */
  /* -------------------------------------------------- */

  if (!data && !summary && isLoading) {
    return <LoadingState />;
  }

  if (isError && !data && !summary) {
    return <ApiErrorState error={error} onRetry={() => refetch()} />;
  }

  if (data && data.kind === "pending") {
    return <PendingResultState message={data.message} />;
  }

  if (!source) return null;

  /* -------------------------------------------------- */
  /* Final rank + label resolution                      */
  /* -------------------------------------------------- */

  const finalRank =
    summaryRank ?? (rankData?.kind === "ok" ? rankData.rank : null);

  const totalParticipants =
    summaryTotalParticipants ??
    (rankData?.kind === "ok" ? rankData.totalParticipants : null);

  const performanceLabel =
    summaryPerformanceLabel ??
    (rankData?.kind === "ok" ? rankData.performanceLabel : null);

  /* -------------------------------------------------- */
  /* Summary values                                    */
  /* -------------------------------------------------- */

  const obtainedMarks = source.obtainedMarks;

  const totalMarks = source.totalMarks;

  const correctCount = source.correctCount;

  const partialCorrectCount = source.partialCorrectCount;

  const wrongCount = source.wrongCount;

  const unansweredCount = source.unansweredCount;

  const submittedAt = source.submittedAt;

  const percentage = source.percentage;

  const title = "test" in source ? source.test.title : "Test Result";

  /* -------------------------------------------------- */
  /* UI (UNCHANGED except rank block)                   */
  /* -------------------------------------------------- */

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-8">
      {/* Header */}

      <Card className="relative overflow-hidden rounded-sm shadow-none bg-linear-to-br from-background to-muted/40">
        <CardHeader className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl  font-semibold tracking-tight">
              {title}
            </CardTitle>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Submitted At: <CalendarDays className="h-4 w-4" />
              {new Date(submittedAt).toLocaleString()}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score */}

      <Card className="rounded-sm shadow-none  bg-linear-to-br from-background to-muted/40 relative">
        <CardContent className="p-8 space-y-8 ">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            {/* Marks */}

            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl" />
                <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background ">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Marks Obtained</p>

                <p className="text-4xl font-bold tracking-tight">
                  <CountUpNumber value={obtainedMarks} start duration={1} />
                  <span className="text-xl text-muted-foreground font-medium">
                    /{totalMarks}
                  </span>
                </p>
              </div>
            </div>

            {/* Rank — Redesigned */}
            <div className="min-h-24 flex items-center">
              {finalRank !== null ? (
                <div className="relative flex items-center gap-6 rounded-2xl ">
                  {/* Medal Icon Ring */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl" />
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background">
                      <Medal className="h-7 w-7 text-primary" />
                    </div>
                  </div>

                  {/* Rank Content */}
                  <div className="space-y-1">
                    <p className="text-xs  tracking-wide text-muted-foreground">
                      Overall Rank
                    </p>

                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold tracking-tight  text-primary">
                        #{finalRank}
                      </span>

                      {totalParticipants && (
                        <span className="text-sm text-muted-foreground mb-1">
                          / {totalParticipants}
                        </span>
                      )}
                    </div>

                    {totalParticipants && (
                      <p className="text-xs text-muted-foreground">
                        Among {totalParticipants.toLocaleString()} students
                      </p>
                    )}
                  </div>
                </div>
              ) : shouldFetchRank && isRankLoading ? (
                <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                  <Loader className="animate-spin h-4 w-4" />
                  {rotatingMessage}
                </p>
              ) : isRankError ? (
                <p className="text-sm text-muted-foreground">
                  Unable to fetch rank right now.
                </p>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Rank will be available once test window closes.
                </span>
              )}
            </div>
          </div>

          {/* Percentage */}

          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Percent className="h-4 w-4" />
                Score Percentage
              </div>

              <span className="text-lg font-semibold">
                <CountUpNumber value={percentage} start duration={1} />%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${
                  performanceLabel
                    ? performanceBarStyles[performanceLabel]
                    : "bg-primary"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end absolute bottom-4 right-4">
            {/* Performance Text */}
            {performanceLabel && (
              <p
                className={`text-xs font-medium ${
                  performanceTextStyles[performanceLabel]
                }`}
              >
                <span className="text-primary"> Overall Assessment: </span>{" "}
                {performanceLabel}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 md:grid-cols-4 auto-rows-fr"
      >
        <StatCard
          title="Correct Answers"
          value={correctCount}
          description="Questions answered fully correct."
          icon={<CheckCircle2 className="text-green-600" />}
          tone="bg-green-500/10"
        />

        <StatCard
          title="Partially Correct"
          value={partialCorrectCount}
          description="You selected some correct options, but missed others."
          icon={<Target className="text-emerald-600" />}
          tone="bg-emerald-500/10"
        />

        <StatCard
          title="Incorrect"
          value={wrongCount}
          description="Answered but did not match correct options."
          icon={<XCircle className="text-red-600" />}
          tone="bg-red-500/10"
        />

        <StatCard
          title="Unanswered"
          value={unansweredCount}
          description="Questions you did not attempt."
          icon={<AlertCircle className="text-muted-foreground" />}
          tone="bg-muted"
        />
      </motion.div>

      {/* CTA (UNCHANGED) */}

      <Card className="rounded-sm shadow-none bg-linear-to-br from-background to-muted/40">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
          <p className="text-sm text-muted-foreground max-w-md">
            Review question-wise solutions, correct answers, and detailed
            performance insights.
          </p>

          <Link href={`/tests/results/${attemptId}/detailed`}>
            <Button size="lg" className="rounded-sm">
              View Detailed Analysis
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
