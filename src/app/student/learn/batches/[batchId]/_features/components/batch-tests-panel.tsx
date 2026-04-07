"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { RotateCcw, BarChart3, Lock, Info } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/src/components/ui/alert-dialog";
import { getDistributionStatus } from "../helper-functions/helper";
import { format } from "date-fns";

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
  const res = await fetch(`/api/batches/${batchId}/tests`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to load tests");

  return res.json();
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
    staleTime: 0,
    gcTime: 0,
  });

  /* -------------------------------------------------- */
  /* Navigation */
  /* -------------------------------------------------- */

  function goToInstructions(distributionId: string) {
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
          {/* Section title */}
          <Skeleton className="text-base font-medium h-5 w-28 mb-3 rounded-sm" />

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-lg border py-4">
                <CardContent className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-40 rounded-sm" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>

                  {/* Info rows */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-24" />
                      </div>

                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Skeleton className="h-9 w-28 rounded-md" />
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

    /* badge color */
    const badgeClass =
      status === "scheduled"
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
        : status === "ongoing"
          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
          : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";

    let actionButton: React.ReactNode;

    if (status === "scheduled") {
      actionButton = (
        <Button size="sm" variant="ghost" disabled>
          <Lock className="mr-2 h-4 w-4" />
          Locked
        </Button>
      );
    } else if (
      status === "ongoing" &&
      attempt.status === "in_progress" &&
      attempt.attemptId
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
    } else if (status === "ongoing" && attempt.status === "none") {
      actionButton = (
        <Button size="sm" onClick={() => goToInstructions(test.distributionId)}>
          <Info className="mr-2 h-4 w-4" />
          Instructions
        </Button>
      );
    } else {
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
        className="rounded-lg border hover:bg-muted/40 transition py-4"
      >
        <CardContent className="p-4 space-y-4">
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

  const scheduled = data.filter(
    (t) => getDistributionStatus(t.startsAt, t.endsAt) === "scheduled",
  );

  const ongoing = data.filter(
    (t) => getDistributionStatus(t.startsAt, t.endsAt) === "ongoing",
  );

  const completed = data.filter(
    (t) => getDistributionStatus(t.startsAt, t.endsAt) === "completed",
  );

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
