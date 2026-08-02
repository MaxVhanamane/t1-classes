"use client";

import { useParams } from "next/navigation";

import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";

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
      <ErrorStateCard
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data) {
    return (
      <ErrorStateCard
        message="Test not found."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const { test, sections, totalMarks, totalQuestions, totalSections } = data;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <TestBuilderHeader
        test={test}
        totalMarks={totalMarks}
        totalQuestions={totalQuestions}
        totalSections={totalSections}
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
