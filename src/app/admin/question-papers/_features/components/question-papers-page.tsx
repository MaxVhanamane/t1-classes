"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";

import { DEFAULT_QUESTION_PAPER_FILTERS } from "../constants/question-paper.constants";

import { QuestionPaperFiltersBar } from "./question-paper-filters";
import { QuestionPapersTable } from "./question-papers-table";
import { QuestionPaperDialog } from "./question-paper-dialog";
import { QuestionPaperDeleteDialog } from "./question-paper-delete-dialog";

import { useQuestionPapers } from "../hooks/use-question-papers";

import { QuestionPaper } from "../types/question-paper";
import { PdfViewerDialog } from "@/src/app/student/learn/courses/[slug]/_features/components/pdf/pdf-viewer-dialog";
import { getPdfSignedUrl } from "../../../curriculum/[courseId]/_features/actions/topic/pdf/get-signed-pdf-url";
import { Link } from "@/src/components/ui/link";
import { Pagination } from "@/src/components/ui/pagination/pagination";

export function QuestionPapersPage() {
  const [filters, setFilters] = useState(DEFAULT_QUESTION_PAPER_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);

  const [viewerLoading, setViewerLoading] = useState(false);

  const [viewerTitle, setViewerTitle] = useState<string | null>(null);

  const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);

  const [selectedQuestionPaper, setSelectedQuestionPaper] = useState<
    QuestionPaper | undefined
  >();

  const [questionPaperToDelete, setQuestionPaperToDelete] = useState<
    QuestionPaper | undefined
  >();

  const { data, isLoading, error } = useQuestionPapers(filters);

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

  function handleEdit(questionPaper: QuestionPaper) {
    setSelectedQuestionPaper(questionPaper);

    setEditDialogOpen(true);
  }

  function handleDelete(questionPaper: QuestionPaper) {
    setQuestionPaperToDelete(questionPaper);

    setDeleteDialogOpen(true);
  }

  function handleEditDialogChange(open: boolean) {
    setEditDialogOpen(open);

    if (!open) {
      setSelectedQuestionPaper(undefined);
    }
  }

  function handleDeleteDialogChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) {
      setQuestionPaperToDelete(undefined);
    }
  }

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Question Papers</h1>

            <p className="text-muted-foreground text-sm">
              Manage reusable question papers and practice PDFs.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link href="/admin/question-paper-attachments">
                Attach to Courses & Batches
              </Link>
            </Button>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Upload Question Paper
            </Button>
          </div>
        </div>
        <QuestionPaperFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onFiltersChange={setFilters}
        />

        {error instanceof Error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error.message}
          </div>
        ) : (
          <>
            <QuestionPapersTable
              items={data?.items ?? []}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {data && data.totalPages > 1 && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalCount={data.totalCount}
                pageSize={data.pageSize}
                onPageChange={(page) =>
                  setFilters((prev) => ({
                    ...prev,
                    page,
                  }))
                }
              />
            )}
          </>
        )}
      </div>

      <QuestionPaperDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <QuestionPaperDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogChange}
        questionPaper={selectedQuestionPaper}
      />

      <QuestionPaperDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        questionPaper={questionPaperToDelete}
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
