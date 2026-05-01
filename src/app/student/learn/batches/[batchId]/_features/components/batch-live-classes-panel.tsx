"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { useRouter } from "nextjs-toploader/app";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";

import DottedBackground from "@/src/components/dotted-background";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { LiveClassActionButton } from "./live-class-action-button";

type LiveClassStatus = "upcoming" | "live" | "completed";

type BatchLiveClass = {
  id: string;
  title: string;
  description: string | null;
  youtube_live_id: string;
  starts_at: string;
  ends_at: string;
};

type LiveClassesResponse = {
  rows: BatchLiveClass[];
  page: number;
  limit: number;
  total: number;
};

async function fetchLiveClasses(
  batchId: string,
  page: number,
): Promise<LiveClassesResponse> {
  return fetchWrapper<LiveClassesResponse>(
    `/api/batches/${batchId}/live-classes?page=${page}&limit=6`,
  );
}

function getStatus(startsAt: string, endsAt: string): LiveClassStatus {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  if (now < start) {
    return "upcoming";
  }

  if (now <= end) {
    return "live";
  }

  return "completed";
}

function getBadgeClass(status: LiveClassStatus) {
  if (status === "live") {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-300";
  }

  if (status === "upcoming") {
    return "bg-sky-500/10 text-sky-700 border border-sky-500/20 dark:text-sky-300";
  }

  return "bg-zinc-500/10 text-zinc-700 border border-zinc-500/20 dark:text-zinc-300";
}

export default function BatchLiveClassesPanel({
  batchId,
}: {
  batchId: string;
}) {
  const router = useRouter();

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["batch-live-classes", batchId, page],
    queryFn: () => fetchLiveClasses(batchId, page),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });

  function openLiveClass(item: BatchLiveClass) {
    const params = new URLSearchParams({
      title: item.title,
      youtube: item.youtube_live_id,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      description: item.description ?? "",
    });

    router.push(`/student/live-classes/${item.id}?${params.toString()}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({
          length: 3,
        }).map((_, i) => (
          <Card key={i} className="rounded-lg py-4 md:w-2xl">
            <CardContent className="space-y-4 p-4">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load live classes.
          </p>

          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.rows.length) {
    return (
      <Card className="rounded-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No live classes available for this batch yet.
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.rows.map((item) => {
          const status = getStatus(item.starts_at, item.ends_at);

          return (
            <Card
              key={item.id}
              className="relative rounded-lg border py-4 transition hover:bg-muted/40 md:w-2xl dark:bg-black"
            >
              <DottedBackground />

              <CardContent className="relative z-10 space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{item.title}</h3>

                    {item.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-md px-2 py-1 text-xs capitalize ${getBadgeClass(status)}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />

                    <span>
                      Starts{" "}
                      {format(new Date(item.starts_at), "d MMM · h:mm a")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />

                    <span>
                      Ends {format(new Date(item.ends_at), "d MMM · h:mm a")}
                    </span>
                  </div>
                </div>

                <LiveClassActionButton
                  status={status}
                  startsAt={item.starts_at}
                  onClick={() => openLiveClass(item)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between md:w-2xl">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
