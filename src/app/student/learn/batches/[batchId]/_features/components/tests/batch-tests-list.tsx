"use client";

import { BatchTestCard } from "./batch-test-card";

import { BatchTest } from "../../types/test.types";

type BatchTestsListProps = {
  tests: BatchTest[];
  onStartTest: (distributionId: string) => void;

  onResumeAttempt: (attemptId: string) => void;

  onViewResult: (attemptId: string | undefined, title: string) => void;
};

export function BatchTestsList({
  tests,
  onStartTest,
  onResumeAttempt,
  onViewResult,
}: BatchTestsListProps) {
  return (
    <div className="space-y-3">
      {tests.map((test) => (
        <BatchTestCard
          key={test.distributionId}
          test={test}
          onStartTest={onStartTest}
          onResumeAttempt={onResumeAttempt}
          onViewResult={onViewResult}
        />
      ))}
    </div>
  );
}
