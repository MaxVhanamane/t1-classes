"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";
import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";
import { PdfViewerDialog } from "@/src/components/ui/pdf/pdf-viewer-dialog";

import { DEFAULT_ASSIGNMENT_FILTERS } from "../constants/batch-assignment-filters.constants";
import { useBatchAssignments } from "../hooks/use-batch-assignments";
import type { BatchAssignmentRow } from "../types/batch-assignments.types";

import { getBatchMetadata } from "../../actions/fetch-assignment-options";
import { getPdfSignedUrl } from "@/src/app/admin/curriculum/[courseId]/_features/actions/topic/pdf/get-signed-pdf-url";

import { BatchAssignmentsHeader } from "./batch-assignments-header";
import { BatchAssignmentsEmptyState } from "./batch-assignments-empty-state";
import { BatchAssignmentsTable } from "./batch-assignments-table";
import { AssignHomeworkDialog } from "./assign-homework-dialog";
import { BatchAssignmentsFilterBar } from "./filter/batch-assignments-filter-bar";
import { MarkAssignmentsSheet } from "./marking/mark-assignments-sheet"; // 🔥 Imported the Sheet

type Props = {
  batchId: string;
};

export function BatchAssignmentsManager({ batchId }: Props) {
  // Dialog / Edit State
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BatchAssignmentRow | null>(null);

  // 🔥 Marking Sheet State
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [markingAssignment, setMarkingAssignment] =
    useState<BatchAssignmentRow | null>(null);

  const [filters, setFilters] = useState(DEFAULT_ASSIGNMENT_FILTERS);
  const [searchInput, setSearchInput] = useState("");

  // PDF Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerTitle, setViewerTitle] = useState<string | null>(null);
  const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);

  const { data: batch, isLoading: isBatchLoading } = useQuery({
    queryKey: ["batch-metadata", batchId],
    queryFn: () => getBatchMetadata(batchId),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, error, refetch, isFetching } = useBatchAssignments(
    batchId,
    filters,
  );

  const hasActiveFilters =
    filters.search !== DEFAULT_ASSIGNMENT_FILTERS.search ||
    filters.subject !== DEFAULT_ASSIGNMENT_FILTERS.subject ||
    filters.status !== DEFAULT_ASSIGNMENT_FILTERS.status;

  async function handleViewPdf(path: string, title: string) {
    try {
      setViewerOpen(true);
      setViewerLoading(true);
      setViewerTitle(title);

      const url = await getPdfSignedUrl(path);
      setViewerPdfUrl(url);
    } catch {
      toast.error("Failed to load PDF");
      setViewerOpen(false);
    } finally {
      setViewerLoading(false);
    }
  }

  if (error instanceof Error) {
    return (
      <ErrorStateCard message={error.message} onRetry={() => void refetch()} />
    );
  }

  const subjects = batch?.subjects || [];

  return (
    <div className="space-y-6">
      <BatchAssignmentsHeader
        batchId={batchId}
        isFetching={isFetching}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
      />

      <BatchAssignmentsFilterBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
        subjects={subjects}
      />

      {isLoading || isBatchLoading ? (
        <TableSkeleton rows={5} columns={8} showTableHeader />
      ) : !data || data.items.length === 0 ? (
        <BatchAssignmentsEmptyState
          hasFilters={hasActiveFilters}
          onResetFilters={() => {
            setSearchInput("");
            setFilters(DEFAULT_ASSIGNMENT_FILTERS);
          }}
          onCreateAssignment={() => {
            setEditing(null);
            setOpen(true);
          }}
        />
      ) : (
        <>
          <div
            className={cn(
              "transition-opacity duration-200",
              isFetching && "opacity-60",
            )}
          >
            <BatchAssignmentsTable
              assignments={data.items}
              onEdit={(assignment) => {
                setEditing(assignment);
                setOpen(true);
              }}
              onViewPdf={handleViewPdf}
              onMark={(assignment) => {
                setMarkingAssignment(assignment);
                setIsMarkingOpen(true);
              }}
            />
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.total}
            pageSize={data.pageSize}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </>
      )}

      {open && batch && (
        <AssignHomeworkDialog
          batchId={batchId}
          subjects={subjects}
          classLevel={batch.class_level}
          targetExam={batch.target_exam}
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setEditing(null);
          }}
          assignment={editing}
          onViewPdf={handleViewPdf}
        />
      )}

      {/* 🔥 The New Marking Sheet */}
      <MarkAssignmentsSheet
        batchId={batchId}
        assignment={markingAssignment}
        open={isMarkingOpen}
        onOpenChange={(isOpen) => {
          setIsMarkingOpen(isOpen);
          if (!isOpen) setMarkingAssignment(null);
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
    </div>
  );
}
