"use client";

import { addSeconds, format } from "date-fns";
import { Info, Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import DottedBackground from "@/src/components/dotted-background";

import { BatchTest } from "../../types/test.types";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
import { useTransition } from "react";

type BatchTestCardProps = {
  test: BatchTest;
  onStartTest: (distributionId: string) => void;
  onResumeAttempt: (attemptId: string) => void;
  onViewResult: (attemptId: string | undefined, title: string) => void;
};

export function BatchTestCard({
  test,
  onStartTest,
  onResumeAttempt,
  onViewResult,
}: BatchTestCardProps) {
  // 1. Initialize the transition hook
  const [isPending, startTransition] = useTransition();

  const status = test.status;
  const attempt = test.attempt;

  const start = new Date(test.startsAt);
  const end = new Date(test.endsAt);

  const isAttemptExpired = test.isAttemptExpired;
  const isResultUnlocked = test.isResultUnlocked;
  const resultAvailableAt = addSeconds(end, TEST_GRACE_TIME_IN_SECONDS);

  const statusBadgeClass =
    status === "scheduled"
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
      : status === "ongoing"
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        : "bg-secondary text-secondary-foreground";

  // 2. Create transition wrappers for your navigation callbacks
  const handleStartTest = () => {
    startTransition(() => {
      onStartTest(test.distributionId);
    });
  };

  const handleResumeAttempt = () => {
    startTransition(() => {
      onResumeAttempt(attempt.attemptId!);
    });
  };

  const handleViewResult = () => {
    startTransition(() => {
      onViewResult(attempt.attemptId, test.title);
    });
  };

  let actionButton: React.ReactNode;

  // 3. Inject isPending, the new handlers, and the Loader2 spinner
  if (status === "scheduled") {
    actionButton = (
      <Button size="sm" variant="outline" disabled className="w-full sm:w-auto">
        Locked
      </Button>
    );
  } else if (status === "ongoing" && attempt.status === "none") {
    actionButton = (
      <Button
        size="sm"
        disabled={isPending}
        onClick={handleStartTest}
        className="relative w-full sm:w-auto"
      >
        <span className={isPending ? "opacity-0" : "opacity-100"}>
          Go to Test
        </span>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </Button>
    );
  } else if (
    status === "ongoing" &&
    attempt.status === "in_progress" &&
    attempt.attemptId &&
    !isAttemptExpired
  ) {
    actionButton = (
      <Button
        size="sm"
        variant="secondary"
        disabled={isPending}
        onClick={handleResumeAttempt}
        className="relative w-full sm:w-auto"
      >
        <span className={isPending ? "opacity-0" : "opacity-100"}>
          Resume Attempt
        </span>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </Button>
    );
  } else if (
    attempt.status === "in_progress" &&
    attempt.attemptId &&
    isAttemptExpired &&
    !isResultUnlocked
  ) {
    actionButton = (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <p className="text-center text-xs text-muted-foreground sm:text-right">
          Results at {format(resultAvailableAt, "h:mm a")}
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled
          className="w-full sm:w-auto"
        >
          Result Pending
        </Button>
      </div>
    );
  } else {
    actionButton = (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleViewResult}
        className="relative w-full sm:w-auto"
      >
        <span className={isPending ? "opacity-0" : "opacity-100"}>
          View Result
        </span>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </Button>
    );
  }
  return (
    <Card className="relative overflow-hidden rounded-xl border py-3 shadow-sm transition hover:shadow-md dark:bg-black md:max-w-2xl">
      <DottedBackground />

      <CardContent className="relative z-10 flex flex-col px-4 py-2 sm:px-5">
        {/* === TITLE & SUBTITLE === */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {test.title}
            </h3>

            {test.subjectLabels && test.subjectLabels.length > 0 && (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {test.subjectLabels.join(" • ")}
              </p>
            )}
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${statusBadgeClass}`}
          >
            {status}
          </span>
        </div>

        {/* === METADATA (Auto Grid to keep items close) === */}
        <div className="mt-4 grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-2.5 sm:gap-x-10">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium text-foreground">
              {test.durationMinutes} mins
            </span>
          </div>

          {/* Total Questions */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Questions:</span>
            <span className="font-medium text-foreground">
              {test.totalQuestions}
            </span>
          </div>

          {/* Total Marks */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Total Marks:</span>
            <span className="font-medium text-foreground">
              {test.totalMarks}
            </span>
          </div>

          {/* Format */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Format:</span>
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span className="capitalize">{test.testType}</span>
              <RichPopover
                trigger={
                  <button
                    type="button"
                    className="flex items-center focus:outline-none"
                    aria-label="Format Info"
                  >
                    <Info className="size-3.5 text-muted-foreground transition-colors hover:text-foreground" />
                  </button>
                }
              >
                <div className="max-w-70 space-y-2 p-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {test.testType === "standard"
                      ? "Standard Format"
                      : "Sectioned Format"}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {test.testType === "standard"
                      ? "This test contains a continuous list of questions with a single answering format and marking scheme."
                      : "This test is divided into multiple sections. These sections may vary by subject, question format (e.g., Single Choice, Numerical), or marking schemes."}
                  </p>
                </div>
              </RichPopover>
            </div>
          </div>
        </div>

        {/* === BOTTOM ROW (Dates & Action Button) === */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
            {status !== "completed" && (
              <div className="flex items-center gap-2">
                <span className="w-11 sm:w-12">
                  {status === "scheduled" ? "Starts" : "Started"}
                </span>
                <span className="font-medium text-foreground">
                  {format(start, "d MMM · h:mm a")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="w-11 sm:w-12">
                {status === "completed" ? "Ended" : "Ends"}
              </span>
              <span className="font-medium text-foreground">
                {format(end, "d MMM · h:mm a")}
              </span>
            </div>
          </div>

          <div className="w-full shrink-0 sm:w-auto">{actionButton}</div>
        </div>
      </CardContent>
    </Card>
  );
}
