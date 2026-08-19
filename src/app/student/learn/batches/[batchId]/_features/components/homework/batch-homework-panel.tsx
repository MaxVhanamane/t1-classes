"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";
import { PdfViewerDialog } from "@/src/components/ui/pdf/pdf-viewer-dialog";

import { getPdfSignedUrl } from "@/src/app/admin/curriculum/[courseId]/_features/actions/topic/pdf/get-signed-pdf-url";

import { BatchHomeworkTabs } from "./batch-homework-tabs";
import { BatchHomeworkCard } from "./batch-homework-card";
import { BatchHomeworkEmptyState } from "./batch-homework-empty-state";
import { BatchHomeworkSkeleton } from "./batch-homework-skeleton";
import { BatchHomeworkCalendar } from "./batch-homework-calendar"; // <-- Import the calendar!

import {
  HomeworkStatus,
  StudentHomeworkResponse,
} from "../../types/homework.types";

type Props = {
  batchId: string;
};

export default function BatchHomeworkPanel({ batchId }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<HomeworkStatus>("completed");

  // --- PDF Viewer State ---
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerTitle, setViewerTitle] = useState<string | null>(null);
  const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);

  // We only run the paginated query if status is NOT overview
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["batch-homework", batchId, status, page],
    queryFn: () =>
      fetchWrapper<StudentHomeworkResponse>(
        `/api/student/batches/${batchId}/homework?page=${page}&status=${status}`,
      ),
    placeholderData: page > 1 ? (prev) => prev : undefined,
    staleTime: 1000 * 60,
    enabled: status !== "overview", // <-- Disable list fetch when looking at calendar
  });

  function handleTabChange(value: HomeworkStatus) {
    setStatus(value);
    setPage(1);
  }

  function handleRefresh() {
    if (status === "overview") {
      void queryClient.invalidateQueries({
        queryKey: ["homework-calendar", batchId],
      });
    } else {
      void queryClient.invalidateQueries({
        queryKey: ["batch-homework", batchId],
      });
    }
  }

  // --- PDF Viewing Logic ---
  async function handleViewPdf(filePath: string, title: string) {
    try {
      setViewerOpen(true);
      setViewerLoading(true);
      setViewerTitle(title);

      const url = await getPdfSignedUrl(filePath);
      setViewerPdfUrl(url);
    } catch (err) {
      toast.error("Failed to load PDF");
      setViewerOpen(false);
    } finally {
      setViewerLoading(false);
    }
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

  return (
    <>
      <div className="space-y-4 md:max-w-2xl">
        <BatchHomeworkTabs
          value={status}
          onChange={handleTabChange}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />

        {/* If Overview, show Calendar. Otherwise, show the Paginated List */}
        {status === "overview" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BatchHomeworkCalendar batchId={batchId} />
          </div>
        ) : isLoading || !data ? (
          <BatchHomeworkSkeleton />
        ) : data.items.length === 0 ? (
          <BatchHomeworkEmptyState status={status} />
        ) : (
          <>
            <div
              className={
                isFetching
                  ? "opacity-50 transition-opacity duration-200 space-y-3"
                  : "transition-opacity duration-200 space-y-3"
              }
            >
              {data.items.map((hw) => (
                <BatchHomeworkCard
                  key={hw.id}
                  homework={hw}
                  onViewPdf={handleViewPdf}
                />
              ))}
            </div>

            {data.totalPages > 1 && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalCount={data.total}
                pageSize={data.pageSize}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {viewerOpen && (
        <PdfViewerDialog
          title={viewerTitle}
          pdfUrl={viewerPdfUrl}
          loading={viewerLoading}
          onClose={() => {
            setViewerOpen(false);
            setViewerTitle(null);
            setViewerPdfUrl(null);
          }}
        />
      )}
    </>
  );
}
