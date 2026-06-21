"use client";

import { addSeconds, format } from "date-fns";
import { BarChart3, ClipboardCheck, Lock, RotateCcw } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

import { BatchTest } from "../../types/test.types";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";

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
  const status = test.status;

  const attempt = test.attempt;

  const start = new Date(test.startsAt);

  const end = new Date(test.endsAt);

  const isAttemptExpired = test.isAttemptExpired;

  const isResultUnlocked = test.isResultUnlocked;
  const resultAvailableAt = addSeconds(end, TEST_GRACE_TIME_IN_SECONDS);

  const badgeClass =
    status === "scheduled"
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
      : status === "ongoing"
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
        : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20";

  let actionButton: React.ReactNode;

  if (status === "scheduled") {
    actionButton = (
      <Button
        size="sm"
        variant="ghost"
        disabled
        className="border border-border disabled:opacity-100"
      >
        <Lock className="mr-2 h-4 w-4" />
        Locked
      </Button>
    );
  } else if (status === "ongoing" && attempt.status === "none") {
    actionButton = (
      <Button size="sm" onClick={() => onStartTest(test.distributionId)}>
        <ClipboardCheck className="mr-2 h-4 w-4" />
        Go to Test
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
        onClick={() => onResumeAttempt(attempt.attemptId!)}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Resume
      </Button>
    );
  } else if (
    attempt.status === "in_progress" &&
    attempt.attemptId &&
    isAttemptExpired &&
    !isResultUnlocked
  ) {
    actionButton = (
      <div className="flex w-full  items-center justify-between gap-1">
        <p className="text-[11px] text-muted-foreground">
          Results available at {format(resultAvailableAt, "h:mm a")}
        </p>
        <Button size="sm" variant="outline" disabled>
          <BarChart3 className="mr-2 h-4 w-4" />
          Result Pending
        </Button>
      </div>
    );
  } else {
    actionButton = (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onViewResult(attempt.attemptId, test.title)}
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        Result
      </Button>
    );
  }

  return (
    <Card className="relative rounded-lg border py-4 transition hover:bg-muted/40 dark:bg-black md:w-2xl">
      <DottedBackground />

      <CardContent className="z-10 space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{test.title}</h3>

          <span
            className={`rounded-md px-2 py-1 text-xs capitalize ${badgeClass}`}
          >
            {status}
          </span>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Duration:</span>

            <span className="text-xs">{test.durationMinutes} min</span>
          </div>

          <div className="flex gap-3">
            {status !== "completed" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {status === "scheduled" ? "Starts:" : "Started:"}
                </span>

                <span className="text-xs">
                  {format(start, "d MMM · h:mm a")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {status === "completed" ? "Ended:" : "Ends:"}
              </span>

              <span className="text-xs">{format(end, "d MMM · h:mm a")}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">{actionButton}</div>
      </CardContent>
    </Card>
  );
}
