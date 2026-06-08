"use client";

import { useState } from "react";

import { toast } from "sonner";

import { AvailableQuestionPapersTable } from "@/src/components/admin/shared/available-question-papers-table";

import { useAvailableBatchQuestionPapers } from "../hooks/use-available-batch-question-papers";
import { useAttachBatchQuestionPapers } from "../hooks/use-attach-batch-question-papers";
import type { QuestionPaperFilters as QuestionPaperFiltersType } from "@/src/app/admin/question-papers/_features/types/question-paper";

import { AttachmentManagementHeader } from "@/src/components/admin/shared/attachment-management-header";
import { AttachedQuestionPapersTable } from "@/src/components/admin/shared/attached-question-papers-table";
import { RemoveQuestionPaperDialog } from "@/src/components/admin/shared/remove-question-paper-dialog";

import { PdfViewerDialog } from "@/src/app/student/learn/courses/[slug]/_features/components/pdf/pdf-viewer-dialog";

import { getPdfSignedUrl } from "@/src/app/admin/curriculum/[courseId]/_features/actions/topic/pdf/get-signed-pdf-url";

import { useBatchDetails } from "../hooks/use-batch-details";
import { useBatchQuestionPapers } from "../hooks/use-batch-question-papers";
import { useRemoveBatchQuestionPaper } from "../hooks/use-remove-batch-question-paper";

import type { QuestionPaper } from "@/src/app/admin/question-papers/_features/types/question-paper";
import { QuestionPaperFiltersBar } from "@/src/app/admin/question-papers/_features/components/question-paper-filters";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { Link } from "@/src/components/ui/link";
import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import { Pagination } from "@/src/components/ui/pagination/pagination";

export function BatchAttachmentPage({ batchId }: { batchId: string }) {
  const {
    data: batch,
    isLoading: isBatchLoading,
    error: batchError,
  } = useBatchDetails(batchId);

  const { data: attachedPapers, isLoading: arePapersLoading } =
    useBatchQuestionPapers(batchId);

  const attachMutation = useAttachBatchQuestionPapers(batchId);
  const removeMutation = useRemoveBatchQuestionPaper(batchId);
  const [paperToRemove, setPaperToRemove] = useState<QuestionPaper>();
  const [selectedQuestionPaperIds, setSelectedQuestionPaperIds] = useState<
    string[]
  >([]);

  const [searchInput, setSearchInput] = useState("");

  const [availableFilters, setAvailableFilters] =
    useState<QuestionPaperFiltersType>({
      search: "",
      classLevel: null,
      targetExam: null,
      subject: null,
      category: null,
      page: 1,
      pageSize: 20,
    });

  const {
    data: availablePapers,
    isLoading: areAvailablePapersLoading,
    isFetching: areAvailablePapersFetching,
  } = useAvailableBatchQuestionPapers(batchId, availableFilters);

  const [viewerOpen, setViewerOpen] = useState(false);

  const [viewerLoading, setViewerLoading] = useState(false);

  const [viewerTitle, setViewerTitle] = useState<string | null>(null);

  const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);

  async function handleView(questionPaper: QuestionPaper) {
    try {
      setViewerOpen(true);

      setViewerLoading(true);

      setViewerTitle(questionPaper.title);

      const url = await getPdfSignedUrl(questionPaper.file_path);

      setViewerPdfUrl(url);
    } catch {
      toast.error("Failed to load PDF");

      setViewerOpen(false);
    } finally {
      setViewerLoading(false);
    }
  }

  if (isBatchLoading) {
    return <CenteredLoader message="Loading batch information..." />;
  }
  if (batchError instanceof Error) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {batchError.message}
        </div>
      </div>
    );
  }

  if (!batch) {
    return null;
  }

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        <Link href="/admin/question-paper-attachments">
          <Button variant="ghost" className="mb-2 -ml-3">
            <ArrowLeft className="mr-2 size-4" />
            Back to Question Paper Attachments
          </Button>
        </Link>
        <AttachmentManagementHeader
          title={batch.title}
          classLevel={batch.class_level}
          targetExam={batch.target_exam}
        />

        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-medium">Attached Question Papers</h2>

            <p className="text-muted-foreground text-sm">
              Review and manage question papers attached to this batch.
            </p>
          </div>

          <AttachedQuestionPapersTable
            items={attachedPapers?.items ?? []}
            isLoading={arePapersLoading}
            onView={handleView}
            onRemove={(paper) => setPaperToRemove(paper)}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Available Question Papers</h2>

            <p className="text-muted-foreground text-sm">
              Select question papers to attach to this batch.
            </p>
          </div>

          <QuestionPaperFiltersBar
            filters={availableFilters}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onFiltersChange={setAvailableFilters}
          />

          <div
            className={
              areAvailablePapersFetching
                ? "opacity-60 transition-opacity"
                : "transition-opacity"
            }
          >
            <div className="flex h-6 items-center justify-end mr-1">
              <div
                className={
                  areAvailablePapersFetching && !areAvailablePapersLoading
                    ? "flex items-center gap-2 opacity-100 transition-opacity duration-200"
                    : "flex items-center gap-2 opacity-0 transition-opacity duration-200"
                }
              >
                <Loader className="size-4 animate-spin" />

                <span className="text-muted-foreground text-sm">
                  Updating results...
                </span>
              </div>
            </div>
            <AvailableQuestionPapersTable
              items={availablePapers?.items ?? []}
              isLoading={areAvailablePapersLoading}
              selectedIds={selectedQuestionPaperIds}
              onSelectionChange={setSelectedQuestionPaperIds}
            />
          </div>

          {availablePapers && availablePapers.totalPages > 1 && (
            <Pagination
              page={availablePapers.page}
              totalPages={availablePapers.totalPages}
              totalCount={availablePapers.totalCount}
              pageSize={availablePapers.pageSize}
              onPageChange={(page) =>
                setAvailableFilters((prev) => ({
                  ...prev,
                  page,
                }))
              }
            />
          )}
          <div className="flex justify-end">
            <Button
              disabled={
                selectedQuestionPaperIds.length === 0 ||
                attachMutation.isPending
              }
              onClick={() => {
                attachMutation.mutate(
                  {
                    questionPaperIds: selectedQuestionPaperIds,
                  },
                  {
                    onSuccess: () => {
                      toast.success(
                        `${selectedQuestionPaperIds.length} question papers attached.`,
                      );

                      setAvailableFilters((prev) => ({
                        ...prev,
                        page: 1,
                      }));

                      setSelectedQuestionPaperIds([]);
                    },

                    onError: (error) => {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Failed to attach question papers.",
                      );
                    },
                  },
                );
              }}
            >
              {attachMutation.isPending
                ? "Attaching..."
                : `Attach Selected (${selectedQuestionPaperIds.length})`}
            </Button>
          </div>
        </div>
      </div>

      <RemoveQuestionPaperDialog
        open={!!paperToRemove}
        onOpenChange={(open) => {
          if (!open) {
            setPaperToRemove(undefined);
          }
        }}
        questionPaper={paperToRemove}
        targetType="batch"
        isPending={removeMutation.isPending}
        onConfirm={() => {
          if (!paperToRemove) {
            return;
          }

          removeMutation.mutate(paperToRemove.id, {
            onSuccess: () => {
              toast.success(`"${paperToRemove.title}" removed from batch.`);

              setPaperToRemove(undefined);
            },
          });
        }}
      />

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
