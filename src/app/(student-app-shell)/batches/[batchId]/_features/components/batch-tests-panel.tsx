"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
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
    maxAttempts: number;
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
  });

  /* -------------------------------------------------- */
  /* Navigation */
  /* -------------------------------------------------- */

  function goToInstructions(distributionId: string) {
    router.push(`/tests/instructions/${distributionId}`);
  }

  function goToAttempt(attemptId: string) {
    router.push(`/tests/attempt/${attemptId}`);
  }

  function handleResultClick(attemptId: string | undefined, title: string) {
    if (!attemptId) {
      setSelectedTestTitle(title);
      setNotAttemptedOpen(true);
      return;
    }

    router.push(`/tests/results/${attemptId}`);
  }

  /* -------------------------------------------------- */
  /* Loading Skeleton — Pixel Matched */
  /* -------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Fragment key={i}>
            <Skeleton className="text-base font-medium h-5 w-28 mb-3 rounded-sm" />
            <Card className="rounded-sm">
              <CardHeader>
                <Skeleton className="h-7.25 w-48 rounded-sm" />
              </CardHeader>

              <CardContent className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded-sm" />
                  <Skeleton className="h-4 w-32 rounded-sm" />
                </div>

                <Skeleton className="h-9 w-32 rounded-sm" />
              </CardContent>
            </Card>
          </Fragment>
        ))}
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

    let actionButton: React.ReactNode;

    /* Scheduled */

    if (status === "scheduled") {
      actionButton = (
        <Button size="sm" variant="ghost" disabled>
          <Lock className="mr-2 h-4 w-4" />
          Locked
        </Button>
      );
    } else if (
      /* Ongoing — Resume */
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
          Resume Test
        </Button>
      );
    } else if (status === "ongoing" && attempt.status === "none") {
      /* Ongoing — Start */
      actionButton = (
        <Button size="sm" onClick={() => goToInstructions(test.distributionId)}>
          <Info className="mr-2 h-4 w-4" />
          View Instructions
        </Button>
      );
    } else {
      /* Completed */
      actionButton = (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResultClick(attempt.attemptId, test.title)}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          View Result
        </Button>
      );
    }

    return (
      <Card key={test.distributionId} className="rounded-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">{test.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="space-y-1">
            <p>Duration: {test.durationMinutes} min</p>

            <p>
              Attempts: {attempt.attemptsUsed} / {attempt.maxAttempts}
            </p>
          </div>

          {actionButton}
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
