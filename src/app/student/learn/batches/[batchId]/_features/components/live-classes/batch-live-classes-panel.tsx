"use client";

import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "nextjs-toploader/app";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import { Pagination } from "@/src/components/ui/pagination/pagination";

import { LiveClassesTabs } from "./live-classes-tabs";
import { LiveClassesList } from "./live-classes-list";
import { LiveClassesSkeleton } from "./live-classes-skeleton";
import { LiveClassesEmptyState } from "./live-classes-empty-state";
import { LiveClassesErrorState } from "./live-classes-error-state";

import {
  BatchLiveClass,
  LiveClassesResponse,
  LiveClassStatus,
} from "../../types/live-class.types";

type Props = {
  batchId: string;
};

async function fetchLiveClasses(
  batchId: string,
  status: LiveClassStatus,
  page: number,
): Promise<LiveClassesResponse> {
  return fetchWrapper<LiveClassesResponse>(
    `/api/batches/${batchId}/live-classes?page=${page}&status=${status}`,
  );
}

export default function BatchLiveClassesPanel({ batchId }: Props) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState<LiveClassStatus>("live");

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["batch-live-classes", batchId, status, page],

    queryFn: () => fetchLiveClasses(batchId, status, page),

    placeholderData: page > 1 ? (previousData) => previousData : undefined,

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 30,
  });

  function handleRefresh() {
    void queryClient.invalidateQueries({
      queryKey: ["batch-live-classes", batchId],
    });
  }

  function handleTabChange(value: LiveClassStatus) {
    setStatus(value);

    setPage(1);
  }

  function openLiveClass(liveClass: BatchLiveClass) {
    const params = new URLSearchParams({
      title: liveClass.title,

      youtube: liveClass.youtubeLiveId,

      starts_at: liveClass.startsAt,

      ends_at: liveClass.endsAt,

      description: liveClass.description ?? "",
    });

    router.push(`/student/live-classes/${liveClass.id}?${params.toString()}`);
  }

  if (error instanceof Error) {
    return (
      <LiveClassesErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 md:w-2xl">
      <LiveClassesTabs
        value={status}
        onChange={handleTabChange}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {isLoading ? (
        <LiveClassesSkeleton />
      ) : !data ? (
        <LiveClassesSkeleton />
      ) : data.items.length === 0 ? (
        <LiveClassesEmptyState status={status} />
      ) : (
        <>
          <div
            className={
              isFetching
                ? "opacity-50 transition-opacity duration-200"
                : "transition-opacity duration-200"
            }
          >
            <LiveClassesList items={data.items} onOpen={openLiveClass} />
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
