"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/src/components/ui/card";

import { QuestionBuilderHeader } from "./question-builder-header";
import { SectionRulesCard } from "./section-rules-card";
import { QuestionsList } from "./questions/questions-list";
import { QuestionsEmptyState } from "./questions/questions-empty-state";
import { QuestionBuilderDialog } from "./question-builder/question-builder-dialog";
import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";
import { RecentlyAddedQuestion } from "./questions/recently-added-question";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

import { useSectionDetails } from "../hooks/use-section-details";
import { useQuestions } from "../hooks/use-questions";
import { cn } from "@/src/lib/utils";

import type { TestQuestion } from "../types/question.types";

export function QuestionBuilderClient() {
  const params = useParams<{
    testId: string;
    sectionId: string;
  }>();

  const testId = params.testId;
  const sectionId = params.sectionId;

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestQuestion | null>(null);
  const [recentQuestion, setRecentQuestion] = useState<TestQuestion | null>(
    null,
  );

  const {
    data: section,
    isLoading: isSectionLoading,
    error: sectionError,
    refetch: refetchSection,
  } = useSectionDetails(testId, sectionId);

  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    isFetching,
  } = useQuestions(sectionId, page);

  const questions = questionsData?.items ?? [];
  // For pagination internals
  const paginatedTotal = questionsData?.total ?? 0;
  const totalPages = questionsData?.totalPages ?? 0;
  const pageSize = questionsData?.pageSize ?? 10;

  function dismissRecentQuestion() {
    setRecentQuestion(null);
  }

  function handleAdd() {
    if (!section) return;

    if (section.is_locked) {
      toast.info(
        "This test is locked because it has already been scheduled or attempted.",
      );
      return;
    }
    dismissRecentQuestion();
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(question: TestQuestion) {
    if (!section) return;

    if (section.is_locked) {
      toast.info("Locked tests cannot be modified.");
      return;
    }

    setEditing(question);
    setOpen(true);
    dismissRecentQuestion();
  }

  if (sectionError instanceof Error) {
    return (
      <ErrorStateCard
        message={sectionError.message}
        onRetry={() => {
          void refetchSection();
        }}
      />
    );
  }

  if (isSectionLoading || !section) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 py-4 px-1 sm:px-2 md:px-4">
        <div className="space-y-3">
          <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
        </div>

        <Card className="space-y-4 p-6">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-3 md:grid-cols-2">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="space-y-3 rounded-lg border p-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="grid gap-2 pt-2">
                <div className="h-8 animate-pulse rounded bg-muted" />
                <div className="h-8 animate-pulse rounded bg-muted" />
                <div className="h-8 animate-pulse rounded bg-muted" />
                <div className="h-8 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-10 w-full max-w-5xl space-y-6 py-4 px-1.5 sm:px-2 md:px-4">
      <QuestionBuilderHeader
        testId={testId}
        section={section}
        // Grab the total count instantly from our new DB column!
        questionCount={section.sectionTotalQuestions}
        onAddQuestion={handleAdd}
        isLoading={isQuestionsLoading}
      />

      <SectionRulesCard section={section} />

      {recentQuestion && (
        <RecentlyAddedQuestion
          question={recentQuestion}
          section={section}
          totalQuestions={section.sectionTotalQuestions}
          questionsPerPage={pageSize}
          onDismiss={dismissRecentQuestion}
          currentPage={page}
        />
      )}

      {isQuestionsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="space-y-3 rounded-lg border p-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="grid gap-2 pt-2">
                <div className="h-8 animate-pulse rounded bg-muted" />
                <div className="h-8 animate-pulse rounded bg-muted" />
                <div className="h-8 animate-pulse rounded bg-muted" />
                <div className="h-8 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div
            className={cn(
              "space-y-3 transition-opacity duration-200",
              isFetching && "opacity-50",
            )}
          >
            {section.sectionTotalQuestions === 0 ? (
              <QuestionsEmptyState
                answerMode={section.answerMode}
                onAddQuestion={handleAdd}
              />
            ) : (
              <>
                <QuestionsList
                  section={section}
                  questions={questions}
                  onAddQuestion={handleAdd}
                  onEditQuestion={handleEdit}
                  dismissRecentQuestion={dismissRecentQuestion}
                  startIndex={(page - 1) * pageSize}
                />

                <div className="min-h-8 ">
                  {isFetching && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <LoadingIndicator className="size-4" />
                      Loading questions...
                    </div>
                  )}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalCount={paginatedTotal}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </>
      )}

      <QuestionBuilderDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);

          if (!nextOpen) {
            setEditing(null);
          }
        }}
        section={section}
        editingQuestion={editing}
        onQuestionCreated={(question) => {
          setRecentQuestion(question);
        }}
      />
    </div>
  );
}
