"use client";

import { useState } from "react";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { CardSkeleton } from "@/src/components/ui/skeleton/table/table-cards-skeleton";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";

import { DEFAULT_BATCH_FILTERS } from "../constants/batch-filters.constants";

import { useBatches } from "../hooks/use-batches";

import type { BatchListItem } from "../types/types";

import { BatchDialog } from "./batch-dialog";
import { BatchesCards } from "./batches-cards";
import { BatchesHeader } from "./batches-header";
import { BatchesTable } from "./batches-table";
import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";
import { BatchFiltersBar } from "./filter/batch-filters-bar";
import { BatchesEmptyState } from "./batches-empty-state";
import { useCourseOptions } from "@/src/hooks/use-course-options";
import { useInstructorOptions } from "@/src/hooks/use-instructor-options";

export function BatchesClient() {
  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState<BatchListItem | null>(null);

  const [filters, setFilters] = useState(DEFAULT_BATCH_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error, refetch } = useBatches(filters);

  const { data: courses = [], isLoading: isCoursesLoading } =
    useCourseOptions();

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions();

  const hasActiveFilters =
    filters.search !== DEFAULT_BATCH_FILTERS.search ||
    filters.active !== DEFAULT_BATCH_FILTERS.active ||
    filters.lifecycle !== DEFAULT_BATCH_FILTERS.lifecycle ||
    filters.admission !== DEFAULT_BATCH_FILTERS.admission ||
    filters.category !== DEFAULT_BATCH_FILTERS.category ||
    filters.board !== DEFAULT_BATCH_FILTERS.board ||
    filters.mode !== DEFAULT_BATCH_FILTERS.mode ||
    filters.classLevel !== DEFAULT_BATCH_FILTERS.classLevel ||
    filters.targetExam !== DEFAULT_BATCH_FILTERS.targetExam ||
    filters.courseId !== DEFAULT_BATCH_FILTERS.courseId ||
    filters.instructorId !== DEFAULT_BATCH_FILTERS.instructorId;

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
      <BatchesHeader
        onCreate={() => {
          setEditing(null);

          setOpen(true);
        }}
      />

      <BatchFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
        courses={courses}
        instructors={instructors}
        isCoursesLoading={isCoursesLoading}
        isInstructorsLoading={isInstructorsLoading}
      />

      {isLoading ? (
        <>
          <TableSkeleton rows={4} columns={11} showTableHeader />

          <CardSkeleton extraFields={5} />
        </>
      ) : !data || data.items.length === 0 ? (
        <BatchesEmptyState
          hasFilters={hasActiveFilters}
          onResetFilters={() => {
            setSearchInput("");

            setFilters(DEFAULT_BATCH_FILTERS);
          }}
          onCreateBatch={() => {
            setEditing(null);

            setOpen(true);
          }}
        />
      ) : (
        <>
          <BatchesTable
            batches={data.items}
            onEdit={(batch) => {
              setEditing(batch);

              setOpen(true);
            }}
          />

          <BatchesCards
            batches={data.items}
            onEdit={(batch) => {
              setEditing(batch);

              setOpen(true);
            }}
          />

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.total}
            pageSize={data.pageSize}
            onPageChange={(page) =>
              setFilters((prev) => ({
                ...prev,
                page,
              }))
            }
          />
        </>
      )}

      <BatchDialog
        key={editing?.id ?? "create"}
        open={open}
        onOpenChange={setOpen}
        batch={editing ?? undefined}
        courses={courses}
        isCoursesLoading={isCoursesLoading}
        instructors={instructors}
        isInstructorsLoading={isInstructorsLoading}
      />
    </>
  );
}
