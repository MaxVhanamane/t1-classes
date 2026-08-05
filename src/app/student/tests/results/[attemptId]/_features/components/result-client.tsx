"use client";

import { Card, CardContent } from "@/src/components/ui/card";
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
import { CountUpNumber } from "./count-up-number";
import { ApiErrorState } from "@/src/components/ui/ApiErrorState";
import { PendingResultState } from "./pending-state";
import DottedBackground from "@/src/components/dotted-background";
import { useResultSummary } from "../hooks/use-result-summary";
import { secondsToDurationString } from "../../../../../../../lib/helper-functions/seconds-to-duration-string";
import { DetailedAnalysisCTA } from "./detailed-analysis-cta";
import { ProgressiveTextLoader } from "@/src/components/ui/loading/progressive-text-loader";

const analysisMessages = [
  "Calculating your final score and percentage...",
  "Evaluating correct, partial, and incorrect answers...",
  "Calculating time spent on active questions...",
  "Checking peer rankings and percentiles...",
  "Generating your performance summary...",
];

/* -------------------------------------------------- */

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

  const { data, error, isLoading, isError, refetch } =
    useResultSummary(attemptId);

  /* -------------------------------------------------- */
  /* Guards                                             */
  /* -------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex h-(--h-viewport-minus-navbar) w-full items-center justify-center">
        <ProgressiveTextLoader messages={analysisMessages} />
      </div>
    );
  }

  if (isError || !data) {
    return <ApiErrorState error={error} onRetry={() => refetch()} />;
  }

  if (data.kind === "pending") {
    return <PendingResultState message={data.message} />;
  }

  // --- FIXED DENIED STATE ---
  if (data.kind === "denied") {
    return (
      <div className="flex h-(--h-viewport-minus-navbar) flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          {data.reason === "attempt_not_found" || data.reason === "not_found"
            ? "Result Not Found"
            : "Access Denied"}
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          {data.reason === "attempt_not_found" || data.reason === "not_found"
            ? "We couldn't find the result for this test attempt. It may have been deleted or the link is incorrect."
            : "You do not have permission to view these test results."}
        </p>
        <Link href="/student/dashboard">
          <Button size="lg" className="rounded-sm">
            Return to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* Destructure Values (TypeScript knows kind === 'ok')*/
  /* -------------------------------------------------- */

  const {
    obtainedMarks,
    totalMarks,
    correctCount,
    partialCorrectCount,
    wrongCount,
    unansweredCount,
    submittedAt,
    percentage,
    test: { title },
    activeTimeSeconds,
    rank: finalRank,
    percentile,
    totalParticipants,
    performanceLabel,
    distributionEndsAt,
    rankingAvailableAt,
  } = data;

  const rankingAvailableText = rankingAvailableAt
    ? new Date(rankingAvailableAt).toLocaleString()
    : null;

  const distributionEndsText = distributionEndsAt
    ? new Date(distributionEndsAt).toLocaleString()
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-xl lg:text-2xl truncate font-bold tracking-tight text-foreground">
            {title || "Test Result"}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              Submitted on{" "}
              {new Date(submittedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Score */}
      <Card className="relative overflow-hidden rounded-sm bg-background/80 shadow-none backdrop-blur-xl py-4">
        <DottedBackground className="opacity-[0.35]" />
        <CardContent className="space-y-8 p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            {/* Marks */}
            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl" />
                <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Marks Obtained</p>

                <p className="text-4xl font-bold tracking-tight">
                  <CountUpNumber value={obtainedMarks} start duration={1} />
                  <span className="text-xl font-medium text-muted-foreground">
                    /{totalMarks}
                  </span>
                </p>
              </div>
            </div>

            {/* Rank + Percentile */}
            <div className="flex min-h-24 items-center">
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="h-4 w-4" />
                Score Percentage
              </div>

              <span className="text-lg font-semibold">
                <CountUpNumber value={percentage} start duration={1} />%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
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

          <div className="absolute bottom-4 right-4 flex items-center justify-end">
            {/* Performance Text */}
            {performanceLabel && (
              <p
                className={`text-xs font-medium ${performanceTextStyles[performanceLabel]}`}
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
        className="auto-rows-fr grid grid-cols-2 gap-4 md:grid-cols-4"
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
          icon={<Target className="text-amber-600" />}
          tone="bg-amber-500/10"
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

      <Card className="relative overflow-hidden rounded-sm bg-background/80 shadow-none backdrop-blur-xl py-4">
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

      {/* CTA */}
      <Card className="relative overflow-hidden rounded-sm bg-background/80 shadow-none backdrop-blur-xl border-primary/10 py-4">
        <DottedBackground className="opacity-[0.35]" />

        <CardContent className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between z-10">
          <div className="max-w-md space-y-1 text-center sm:text-left">
            <h3 className="text-base font-semibold text-foreground">
              Deep-Dive Analysis & Solutions
            </h3>
            <p className="text-sm text-muted-foreground">
              Review question-wise solutions, check correct answers, and compare
              your score and time against the class average and the test topper.
            </p>
          </div>

          <div className="flex w-full shrink-0 justify-center sm:w-auto sm:justify-end">
            <DetailedAnalysisCTA
              attemptId={attemptId}
              rankingAvailableAt={rankingAvailableAt}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
