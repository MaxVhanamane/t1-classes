"use client";

import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import { Pagination } from "@/src/components/ui/pagination/pagination";

import { GroupSessionsTabs } from "./group-sessions-tabs";
import { GroupSessionsList } from "./group-sessions-list";
import { GroupSessionsSkeleton } from "./group-sessions-skeleton";
import { GroupSessionsEmptyState } from "./group-sessions-empty-state";
import { GroupSessionsErrorState } from "./group-sessions-error-state";

import {
  GroupSessionStatus,
  GroupSessionsResponse,
} from "../../types/group-session.types";

type Props = {
  batchId: string;
};

async function fetchGroupSessions(
  batchId: string,
  status: GroupSessionStatus,
  page: number,
): Promise<GroupSessionsResponse> {
  return fetchWrapper<GroupSessionsResponse>(
    `/api/student/batches/${batchId}/group-sessions?page=${page}&status=${status}`,
  );
}

export default function BatchGroupSessionsPanel({ batchId }: Props) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState<GroupSessionStatus>("live");

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["batch-group-sessions", batchId, status, page],

    queryFn: () => fetchGroupSessions(batchId, status, page),

    placeholderData: page > 1 ? (previousData) => previousData : undefined,

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 30,
  });

  function handleRefresh() {
    void queryClient.invalidateQueries({
      queryKey: ["batch-group-sessions", batchId],
    });
  }

  function handleTabChange(value: GroupSessionStatus) {
    setStatus(value);

    setPage(1);
  }

  if (error instanceof Error) {
    return (
      <GroupSessionsErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <GroupSessionsTabs
        value={status}
        onChange={handleTabChange}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {isLoading ? (
        <GroupSessionsSkeleton />
      ) : !data ? (
        <GroupSessionsSkeleton />
      ) : data.items.length === 0 ? (
        <GroupSessionsEmptyState status={status} />
      ) : (
        <>
          <div
            className={
              isFetching
                ? "opacity-50 transition-opacity duration-200"
                : "transition-opacity duration-200"
            }
          >
            <GroupSessionsList items={data.items} />
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
