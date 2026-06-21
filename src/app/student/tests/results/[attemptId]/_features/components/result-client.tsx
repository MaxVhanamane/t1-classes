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
  Clock3,
} from "lucide-react";
import { Link } from "@/src/components/ui/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { StatCard } from "./stat-card";
import { LoadingState } from "./loading";
import { CountUpNumber } from "./count-up-number";
import { ApiErrorState } from "@/src/components/ui/ApiErrorState";
import { PendingResultState } from "./pending-state";
import DottedBackground from "@/src/components/dotted-background";
import { useResultSummary } from "../hooks/use-result-summary";
import { secondsToDurationString } from "../../../../../../../lib/helper-functions/seconds-to-duration-string";
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
  activeTimeSeconds: number;
};

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

export function ResultClient() {
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

  const activeTimeSeconds =
    source && "activeTimeSeconds" in source ? source.activeTimeSeconds : 0;

  const finalRank = source && "rank" in source ? source.rank : null;

  const percentile =
    source && "percentile" in source ? source.percentile : null;

  const totalParticipants =
    source && "totalParticipants" in source ? source.totalParticipants : null;

  const performanceLabel =
    source && "performanceLabel" in source ? source.performanceLabel : null;

  const distributionEndsAt =
    source && "distributionEndsAt" in source ? source.distributionEndsAt : null;

  const rankingAvailableAt =
    source && "rankingAvailableAt" in source ? source.rankingAvailableAt : null;

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

  const rankingAvailableText = rankingAvailableAt
    ? new Date(rankingAvailableAt).toLocaleString()
    : null;

  const distributionEndsText = distributionEndsAt
    ? new Date(distributionEndsAt).toLocaleString()
    : null;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-8">
      {/* Header */}

      <Card className="relative overflow-hidden rounded-sm shadow-none bg-background/80 backdrop-blur-xl">
        <DottedBackground className="opacity-[0.35]" />
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

      <Card className="rounded-sm shadow-none relative bg-background/80 backdrop-blur-xl">
        <DottedBackground className="opacity-[0.35]" />
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

            {/* Rank + Percentile */}
            <div className="min-h-24 flex items-center">
              {finalRank !== null ? (
                <div className="flex flex-wrap items-center gap-8">
                  {/* Rank */}
                  <div className="relative flex items-center gap-6 rounded-2xl">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl" />

                      <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background">
                        <Medal className="h-7 w-7 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs tracking-wide text-muted-foreground">
                        Overall Rank
                      </p>

                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold tracking-tight text-primary">
                          #{finalRank}
                        </span>

                        {totalParticipants && (
                          <span className="mb-1 text-sm text-muted-foreground">
                            / {totalParticipants}
                          </span>
                        )}
                      </div>

                      {totalParticipants && (
                        <p className="text-xs text-muted-foreground">
                          Among {totalParticipants.toLocaleString()}{" "}
                          {totalParticipants > 1 ? "students" : "student"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Percentile */}
                  {percentile !== null && (
                    <div className="relative flex items-center gap-6 rounded-2xl">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl" />

                        <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background">
                          <Percent className="h-7 w-7 text-primary" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs tracking-wide text-muted-foreground">
                          Percentile
                        </p>

                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-bold tracking-tight text-primary">
                            {percentile}%
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {percentile >= 99
                            ? "Among the top 1% of participants"
                            : percentile >= 95
                              ? "Among the top 5% of participants"
                              : `Performed better than ${percentile}% of participants`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-md rounded-xl border bg-muted/5 px-4 py-3">
                  <p className="text-sm font-medium">
                    Rank & Percentile Pending
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your test has been evaluated successfully. Rankings and
                    percentiles are generated only after the complete test
                    window closes for all students.
                  </p>

                  {distributionEndsText && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Test window closes: {distributionEndsText}
                    </p>
                  )}

                  {rankingAvailableText && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      Results available after: {rankingAvailableText}
                    </p>
                  )}
                </div>
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

      <Card className="rounded-sm shadow-none bg-background/80 backdrop-blur-xl relative overflow-hidden">
        <DottedBackground className="opacity-[0.35]" />

        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background">
              <Clock3 className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Time Spent Answering Questions
              </p>

              <p className="text-2xl font-semibold tracking-tight">
                {secondsToDurationString(activeTimeSeconds)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Time spent on questions that were answered and saved.
                Unattempted questions are excluded.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA (UNCHANGED) */}

      <Card className="rounded-sm shadow-none bg-background/80 backdrop-blur-xl relative">
        <DottedBackground className="opacity-[0.35]" />
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
          <p className="text-sm text-muted-foreground max-w-md">
            Review question-wise solutions, correct answers, and detailed
            performance insights.
          </p>

          <Link href={`/student/tests/results/${attemptId}/detailed`}>
            <Button size="lg" className="rounded-sm">
              View Detailed Analysis
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
