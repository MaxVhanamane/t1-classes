"use client";

import { useParams } from "next/navigation";

import { BatchTestsErrorState } from "@/src/app/student/learn/batches/[batchId]/_features/components/tests/batch-tests-error-state";

import { TestBuilderHeader } from "./test-builder-header";

import { SectionsEmptyState } from "./section/sections-empty-state";

import { TestSectionsList } from "./section/Test-section-list";

import { useTestDetails } from "../hooks/use-test-details";
import CenteredLoader from "@/src/components/ui/loading/centered-loader";

export function TestBuilderClient() {
  const params = useParams();

  const testId = params.testId as string;

  const { data, isLoading, error, refetch } = useTestDetails(testId);

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error instanceof Error) {
    return (
      <BatchTestsErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data) {
    return (
      <BatchTestsErrorState
        message="Test not found."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const { test, sections, totalMarks, totalQuestions } = data;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <TestBuilderHeader
        test={test}
        totalMarks={totalMarks}
        totalQuestions={totalQuestions}
      />

      {sections.length === 0 ? (
        <SectionsEmptyState
          testId={test.id}
          testType={test.test_type}
          isLocked={test.is_locked}
        />
      ) : (
        <TestSectionsList
          testId={test.id}
          testType={test.test_type}
          sections={sections}
          isLocked={test.is_locked}
        />
      )}
    </div>
  );
}
