"use client";

import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "nextjs-toploader/app";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import { Pagination } from "@/src/components/ui/pagination/pagination";

import { BatchTestsTabs } from "./batch-tests-tabs";
import { BatchTestsList } from "./batch-tests-list";
import { BatchTestsSkeleton } from "./batch-tests-skeleton";
import { BatchTestsEmptyState } from "./batch-tests-empty-state";
import { BatchTestsErrorState } from "./batch-tests-error-state";
import { TestNotAttemptedDialog } from "./test-not-attempted-dialog";

import { BatchTestsResponse, TestStatus } from "../../types/test.types";

type Props = {
  batchId: string;
};

async function fetchBatchTests(
  batchId: string,
  status: TestStatus,
  page: number,
): Promise<BatchTestsResponse> {
  return fetchWrapper<BatchTestsResponse>(
    `/api/student/batches/${batchId}/tests?page=${page}&status=${status}`,
  );
}

export default function BatchTestsPanel({ batchId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState<TestStatus>("ongoing");

  const [notAttemptedOpen, setNotAttemptedOpen] = useState(false);

  const [selectedTestTitle, setSelectedTestTitle] = useState<string | null>(
    null,
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["batch-tests", batchId, status, page],

    queryFn: () => fetchBatchTests(batchId, status, page),

    placeholderData: page > 1 ? (previousData) => previousData : undefined,

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 30,
  });

  function handleRefresh() {
    void queryClient.invalidateQueries({
      queryKey: ["batch-tests", batchId],
    });
  }
  function handleTabChange(value: TestStatus) {
    setStatus(value);

    setPage(1);
  }

  function handleStartTest(distributionId: string) {
    router.push(`/student/tests/instructions/${distributionId}`);
  }

  function handleResumeAttempt(attemptId: string) {
    router.push(`/student/tests/attempt/${attemptId}`);
  }

  function handleViewResult(attemptId: string | undefined, title: string) {
    if (!attemptId) {
      setSelectedTestTitle(title);

      setNotAttemptedOpen(true);

      return;
    }

    router.push(`/student/tests/results/${attemptId}`);
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

  return (
    <>
      <div className="space-y-4 md:w-2xl">
        <BatchTestsTabs
          value={status}
          onChange={handleTabChange}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />

        {isLoading ? (
          <BatchTestsSkeleton />
        ) : !data ? (
          <BatchTestsSkeleton />
        ) : data.items.length === 0 ? (
          <BatchTestsEmptyState status={status} />
        ) : (
          <>
            <div
              className={
                isFetching
                  ? "opacity-50 transition-opacity duration-200"
                  : "transition-opacity duration-200"
              }
            >
              <BatchTestsList
                tests={data.items}
                onStartTest={handleStartTest}
                onResumeAttempt={handleResumeAttempt}
                onViewResult={handleViewResult}
              />
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalCount={data.total}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <TestNotAttemptedDialog
        open={notAttemptedOpen}
        onOpenChange={setNotAttemptedOpen}
        testTitle={selectedTestTitle}
      />
    </>
  );
}
