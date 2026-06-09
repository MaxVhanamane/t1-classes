"use client";

import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PdfViewerDialog } from "@/src/app/student/learn/courses/[slug]/_features/components/pdf/pdf-viewer-dialog";
import { getPdfSignedUrl } from "@/src/app/admin/curriculum/[courseId]/_features/actions/topic/pdf/get-signed-pdf-url";

import { Pagination } from "@/src/components/ui/pagination/pagination";

import { QuestionPapersTabs } from "./question-papers-tabs";
import { QuestionPapersList } from "./question-papers-list";
import { QuestionPapersSkeleton } from "./question-papers-skeleton";
import { QuestionPapersEmptyState } from "./question-papers-empty-state";

import {
  QuestionPaper,
  QuestionPaperCategory,
} from "../../types/question-paper.types";
import { QuestionPapersErrorState } from "./question-papers-error-state";

type Response = {
  items: QuestionPaper[];

  page: number;

  total: number;

  totalPages: number;

  pageSize: number;
};

type Props = {
  batchId: string;
};

async function fetchQuestionPapers(
  batchId: string,
  paperCategory: QuestionPaperCategory,
  page: number,
): Promise<Response> {
  const response = await fetch(
    `/api/student/batches/${batchId}/question-papers?page=${page}&paperCategory=${paperCategory}`,
    {
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load question papers");
  }

  return data;
}

export default function BatchQuestionPapersPanel({ batchId }: Props) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const [paperCategory, setPaperCategory] =
    useState<QuestionPaperCategory>("previous_year");

  const [viewerOpen, setViewerOpen] = useState(false);

  const [viewerLoading, setViewerLoading] = useState(false);

  const [viewerTitle, setViewerTitle] = useState<string | null>(null);

  const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);

  const [viewingPaperId, setViewingPaperId] = useState<string | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [
      "student",
      "batch-question-papers",
      batchId,
      paperCategory,
      page,
    ],

    queryFn: () => fetchQuestionPapers(batchId, paperCategory, page),

    placeholderData: page > 1 ? (previousData) => previousData : undefined,

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 30,
  });

  function handleCategoryChange(value: QuestionPaperCategory) {
    setPaperCategory(value);

    setPage(1);
  }

  function handleRefresh() {
    void queryClient.invalidateQueries({
      queryKey: ["student", "batch-question-papers", batchId],
    });
  }

  async function handleView(questionPaper: QuestionPaper) {
    try {
      setViewingPaperId(questionPaper.id);

      setViewerOpen(true);

      setViewerLoading(true);

      setViewerTitle(questionPaper.title);

      const url = await getPdfSignedUrl(questionPaper.filePath);

      setViewerPdfUrl(url);
    } catch {
      toast.error("Failed to load PDF");

      setViewerOpen(false);
    } finally {
      setViewerLoading(false);

      setViewingPaperId(null);
    }
  }

  if (error instanceof Error) {
    return (
      <QuestionPapersErrorState
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
        <QuestionPapersTabs
          value={paperCategory}
          onChange={handleCategoryChange}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />

        {isLoading ? (
          <QuestionPapersSkeleton />
        ) : !data ? (
          <QuestionPapersSkeleton />
        ) : data.items.length === 0 && !isFetching ? (
          <QuestionPapersEmptyState category={paperCategory} />
        ) : (
          <>
            <div
              className={
                isFetching
                  ? "opacity-50 transition-opacity duration-200"
                  : "transition-opacity duration-200"
              }
            >
              <QuestionPapersList
                items={data.items}
                loadingId={viewingPaperId}
                onView={handleView}
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
