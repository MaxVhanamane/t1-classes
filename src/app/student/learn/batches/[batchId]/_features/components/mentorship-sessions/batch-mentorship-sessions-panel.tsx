"use client";

import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import { Pagination } from "@/src/components/ui/pagination/pagination";

import { MentorshipSessionsTabs } from "./mentorship-sessions-tabs";
import { MentorshipSessionsList } from "./mentorship-sessions-list";
import { MentorshipSessionsSkeleton } from "./mentorship-sessions-skeleton";
import { MentorshipSessionsEmptyState } from "./mentorship-sessions-empty-state";
import { MentorshipSessionsErrorState } from "./mentorship-sessions-error-state";

import {
  MentorshipSessionStatus,
  StudentMentorshipSessionsResponse,
} from "../../types/mentorship-session.types";

type Props = {
  batchId: string;
};

async function fetchMentorshipSessions(
  batchId: string,
  status: MentorshipSessionStatus,
  page: number,
): Promise<StudentMentorshipSessionsResponse> {
  return fetchWrapper<StudentMentorshipSessionsResponse>(
    `/api/student/batches/${batchId}/mentorship-sessions?page=${page}&status=${status}`,
  );
}

export default function BatchMentorshipSessionsPanel({ batchId }: Props) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState<MentorshipSessionStatus>("ended");

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["batch-mentorship-sessions", batchId, status, page],

    queryFn: () => fetchMentorshipSessions(batchId, status, page),

    placeholderData: page > 1 ? (previousData) => previousData : undefined,

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 30,
  });

  function handleRefresh() {
    void queryClient.invalidateQueries({
      queryKey: ["batch-mentorship-sessions", batchId],
    });
  }

  function handleTabChange(value: MentorshipSessionStatus) {
    setStatus(value);

    setPage(1);
  }

  if (error instanceof Error) {
    return (
      <MentorshipSessionsErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <MentorshipSessionsTabs
        value={status}
        onChange={handleTabChange}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {isLoading ? (
        <MentorshipSessionsSkeleton />
      ) : !data ? (
        <MentorshipSessionsSkeleton />
      ) : data.items.length === 0 ? (
        <MentorshipSessionsEmptyState status={status} />
      ) : (
        <>
          <div
            className={
              isFetching
                ? "opacity-50 transition-opacity duration-200"
                : "transition-opacity duration-200"
            }
          >
            <MentorshipSessionsList items={data.items} />
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
  );
}
