"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { RotateCcw, BarChart3, Lock, ClipboardCheck } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/src/components/ui/alert-dialog";
import {
  getAttemptExpiryMs,
  getDistributionStatus,
} from "../helper-functions/helper";
import { format } from "date-fns";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
import DottedBackground from "@/src/components/dotted-background";

/* -------------------------------------------------- */
/* Types */
/* -------------------------------------------------- */

type AttemptStatus = "none" | "in_progress" | "submitted" | "expired";

type BatchTest = {
  distributionId: string;
  testId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;

  attempt: {
    status: AttemptStatus;
    attemptId?: string;
    startedAt?: string;
    timeLimitSeconds?: number;
    attemptsUsed: number;
  };
};

/* -------------------------------------------------- */
/* Fetch */
/* -------------------------------------------------- */

async function fetchBatchTests(batchId: string): Promise<BatchTest[]> {
  return fetchWrapper<BatchTest[]>(`/api/batches/${batchId}/tests`);
}

/* ================================================== */
/* Component */
/* ================================================== */

export default function BatchTestsPanel({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [notAttemptedOpen, setNotAttemptedOpen] = useState(false);

  const [selectedTestTitle, setSelectedTestTitle] = useState<string | null>(
    null,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["batch-tests", batchId],
    queryFn: () => fetchBatchTests(batchId),
    staleTime: 1000 * 60 * 1, // 1 min cache
    gcTime: 1000 * 60 * 30, // 30 min memory
  });

  /* -------------------------------------------------- */
  /* Navigation */
  /* -------------------------------------------------- */

  function goToTest(distributionId: string) {
    router.push(`/student/tests/instructions/${distributionId}`);
  }

  function goToAttempt(attemptId: string) {
    router.push(`/student/tests/attempt/${attemptId}`);
  }

  function handleResultClick(attemptId: string | undefined, title: string) {
    if (!attemptId) {
      setSelectedTestTitle(title);
      setNotAttemptedOpen(true);
      return;
    }

    router.push(`/student/tests/results/${attemptId}`);
  }

  /* -------------------------------------------------- */
  /* Loading Skeleton — Pixel Matched */
  /* -------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="mb-3 h-5 w-28 rounded-sm bg-muted/70 dark:bg-white/10" />

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="relative overflow-hidden rounded-lg border py-4 md:w-2xl dark:bg-black"
              >
                <DottedBackground />

                <CardContent className="relative z-10 space-y-4 p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40 rounded-sm bg-muted/70 dark:bg-white/10" />

                    <div className="h-6 w-20 animate-pulse rounded-md bg-primary/10 dark:bg-primary/15" />
                  </div>

                  {/* Info rows */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16 bg-muted/70 dark:bg-white/10" />
                      <Skeleton className="h-4 w-12 bg-muted/70 dark:bg-white/10" />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-12 bg-muted/70 dark:bg-white/10" />
                        <Skeleton className="h-4 w-24 bg-muted/70 dark:bg-white/10" />
                      </div>

                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-10 bg-muted/70 dark:bg-white/10" />
                        <Skeleton className="h-4 w-24 bg-muted/70 dark:bg-white/10" />
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <div className="h-9 w-28 animate-pulse rounded-md bg-primary/10 dark:bg-primary/15" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Failed to load tests</p>

          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="rounded-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No tests available for this batch yet.
        </CardContent>
      </Card>
    );
  }

  /* -------------------------------------------------- */
  /* Render Test Card */
  /* -------------------------------------------------- */

  function renderTest(test: BatchTest) {
    const status = getDistributionStatus(test.startsAt, test.endsAt);
    const attempt = test.attempt;

    const start = new Date(test.startsAt);
    const end = new Date(test.endsAt);

    const resultUnlockMs =
      new Date(test.endsAt).getTime() + TEST_GRACE_TIME_IN_SECONDS * 1000;

    const isResultUnlocked = Date.now() >= resultUnlockMs;
    /* -------------------------------------------- */
    /* Attempt expiry check for in_progress rows
  /* -------------------------------------------- */
    let isAttemptExpired = false;

    if (
      attempt.status === "in_progress" &&
      attempt.startedAt &&
      attempt.timeLimitSeconds
    ) {
      const expiryMs = getAttemptExpiryMs(
        attempt.startedAt,
        attempt.timeLimitSeconds,
        test.endsAt,
      );

      isAttemptExpired = Date.now() >= expiryMs;
    }

    /* -------------------------------------------- */
    /* badge color
  /* -------------------------------------------- */
    const badgeClass =
      status === "scheduled"
        ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
        : status === "ongoing"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
          : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20";

    let actionButton: React.ReactNode;

    /* -------------------------------------------- */
    /* Scheduled
  /* -------------------------------------------- */
    if (status === "scheduled") {
      actionButton = (
        <Button
          size="sm"
          className="border border-border disabled:opacity-100"
          variant="ghost"
          disabled
        >
          <Lock className="mr-2 h-4 w-4 " />
          Locked
        </Button>
      );
    } else if (status === "ongoing" && attempt.status === "none") {
      /* -------------------------------------------- */
      /* Ongoing + no attempt
  /* -------------------------------------------- */
      actionButton = (
        <Button size="sm" onClick={() => goToTest(test.distributionId)}>
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Go to Test
        </Button>
      );
    } else if (
      /* -------------------------------------------- */
      /* Ongoing + active attempt + still valid
  /* -------------------------------------------- */
      status === "ongoing" &&
      attempt.status === "in_progress" &&
      attempt.attemptId &&
      !isAttemptExpired
    ) {
      actionButton = (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => goToAttempt(attempt.attemptId!)}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Resume
        </Button>
      );
    } else if (
      /* -------------------------------------------- */
      /* Personal timer expired → Result
  /* -------------------------------------------- */
      attempt.status === "in_progress" &&
      attempt.attemptId &&
      isAttemptExpired &&
      !isResultUnlocked
    ) {
      actionButton = (
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" variant="outline" disabled>
            <BarChart3 className="mr-2 h-4 w-4" />
            Result
          </Button>

          <p className="text-[11px] text-muted-foreground">
            Available after {format(resultUnlockMs, "d MMM · h:mm a")}
          </p>
        </div>
      );
    } else if (
      attempt.status === "in_progress" &&
      attempt.attemptId &&
      isAttemptExpired &&
      isResultUnlocked
    ) {
      actionButton = (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResultClick(attempt.attemptId, test.title)}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Result
        </Button>
      );
    } else {
      /* -------------------------------------------- */
      /* Submitted / expired / completed fallback
  /* -------------------------------------------- */
      actionButton = (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResultClick(attempt.attemptId, test.title)}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Result
        </Button>
      );
    }

    return (
      <Card
        key={test.distributionId}
        className="rounded-lg border dark:bg-black hover:bg-muted/40 transition py-4 relative md:w-2xl"
      >
        <DottedBackground />
        <CardContent className="p-4 space-y-4 z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{test.title}</h3>

            <span
              className={`text-xs px-2 py-1 rounded-md capitalize ${badgeClass}`}
            >
              {status}
            </span>
          </div>

          {/* Info rows */}
          <div className="flex flex-col text-sm gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Duration:</span>
              <span className="text-xs">{test.durationMinutes} min</span>
            </div>

            <div className="flex gap-3">
              {status !== "completed" && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {status === "scheduled" ? "Starts:" : "Started:"}
                  </span>

                  <span className="text-xs">
                    {format(start, "d MMM · h:mm a")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {status === "completed" ? "Ended:" : "Ends:"}
                </span>

                <span className="text-xs">{format(end, "d MMM · h:mm a")}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">{actionButton}</div>
        </CardContent>
      </Card>
    );
  }

  /* -------------------------------------------------- */
  /* Sections */
  /* -------------------------------------------------- */

  const scheduled = data
    .filter((t) => getDistributionStatus(t.startsAt, t.endsAt) === "scheduled")
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    ); // nearest upcoming first

  const ongoing = data
    .filter((t) => getDistributionStatus(t.startsAt, t.endsAt) === "ongoing")
    .sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    ); // newest ongoing first

  const completed = data
    .filter((t) => getDistributionStatus(t.startsAt, t.endsAt) === "completed")
    .sort(
      (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
    ); // newest completed first
  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

  return (
    <>
      <div className="space-y-8">
        {renderSection("Ongoing", ongoing)}

        {renderSection("Scheduled", scheduled)}

        {renderSection("Completed", completed)}
      </div>

      {/* Dialog */}

      <AlertDialog open={notAttemptedOpen} onOpenChange={setNotAttemptedOpen}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="p-6 sm:p-7 space-y-6">
            {/* Icon + Heading */}
            <div className="flex flex-col items-center text-center gap-4">
              {/* Icon Ring */}
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl" />

                <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background ">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
              </div>

              <div className="space-y-1.5">
                <AlertDialogTitle className="text-lg font-semibold tracking-tight">
                  Test Not Attempted
                </AlertDialogTitle>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  You did not attempt this test, so a result is not available.
                </p>
              </div>
            </div>

            {/* Test Info Card */}
            {selectedTestTitle && (
              <div className="rounded-xl border bg-muted/40 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Test
                </p>

                <p className="text-sm font-medium text-foreground  line-clamp-1">
                  {selectedTestTitle}
                </p>
              </div>
            )}

            {/* Footer */}
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
              <AlertDialogAction className="w-full sm:w-auto rounded-lg px-6">
                Got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  function renderSection(title: string, tests: BatchTest[]) {
    if (!tests.length) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>

        <div className="space-y-3">{tests.map(renderTest)}</div>
      </div>
    );
  }
}
