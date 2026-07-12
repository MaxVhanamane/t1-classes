"use client";

import { useState } from "react";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { CardSkeleton } from "@/src/components/ui/skeleton/table/table-cards-skeleton";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";

import { BatchTestsErrorState } from "@/src/app/student/learn/batches/[batchId]/_features/components/tests/batch-tests-error-state";

import { DEFAULT_ENROLLMENT_FILTERS } from "../constants/enrollment-filters.constants";

import { useEnrollments } from "../hooks/use-enrollments";

import type { EnrollmentRow } from "../types/enrollments.types";

import { EnrollmentDialog } from "./enrollment-dialog";
import { EnrollmentCards } from "./enrollment-cards";

import { EnrollmentHeader } from "./enrollment-header";
import { EnrollmentTable } from "./enrollment-table";

import { useCourseOptions } from "@/src/hooks/use-course-options";
import { EnrollmentFiltersBar } from "./filter/enrollment-filter-bar";
import { EnrollmentEmptyState } from "./enrollment-empty-state";
import { useEnrollmentBatchOptions } from "../hooks/use-enrollment-batch-options";
import { cn } from "@/src/lib/utils";

export function EnrollmentsClient() {
  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState<EnrollmentRow | null>(null);

  const [filters, setFilters] = useState(DEFAULT_ENROLLMENT_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error, refetch, isFetching } =
    useEnrollments(filters);

  const { data: batches = [], isLoading: isBatchesLoading } =
    useEnrollmentBatchOptions();

  const { data: courses = [], isLoading: isCoursesLoading } =
    useCourseOptions();

  const hasActiveFilters =
    filters.search !== DEFAULT_ENROLLMENT_FILTERS.search ||
    filters.active !== DEFAULT_ENROLLMENT_FILTERS.active ||
    filters.targetType !== DEFAULT_ENROLLMENT_FILTERS.targetType ||
    filters.enrollmentType !== DEFAULT_ENROLLMENT_FILTERS.enrollmentType ||
    filters.registrationChannel !==
      DEFAULT_ENROLLMENT_FILTERS.registrationChannel ||
    filters.batchId !== DEFAULT_ENROLLMENT_FILTERS.batchId ||
    filters.courseId !== DEFAULT_ENROLLMENT_FILTERS.courseId;

  if (error instanceof Error) {
    return (
      <BatchTestsErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <EnrollmentHeader
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        isFetching={isFetching}
      />

      <EnrollmentFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
        batches={batches}
        isBatchesLoading={isBatchesLoading}
        courses={courses}
        isCoursesLoading={isCoursesLoading}
      />

      {isLoading ? (
        <>
          <TableSkeleton rows={4} columns={8} showTableHeader />

          <CardSkeleton extraFields={4} />
        </>
      ) : !data || data.items.length === 0 ? (
        <EnrollmentEmptyState
          hasFilters={hasActiveFilters}
          onResetFilters={() => {
            setSearchInput("");

            setFilters(DEFAULT_ENROLLMENT_FILTERS);
          }}
          onCreateEnrollment={() => {
            setEditing(null);

            setOpen(true);
          }}
        />
      ) : (
        <>
          {/* Desktop */}
          <div className={cn("hidden md:block", isFetching && "opacity-60")}>
            <EnrollmentTable
              enrollments={data.items}
              onEdit={(enrollment) => {
                setEditing(enrollment);

                setOpen(true);
              }}
            />
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <EnrollmentCards
              enrollments={data.items}
              onEdit={(enrollment) => {
                setEditing(enrollment);

                setOpen(true);
              }}
            />
          </div>

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

      {open && (
        <EnrollmentDialog
          enrollment={editing ?? undefined}
          batches={batches}
          courses={courses}
          onClose={() => {
            setOpen(false);

            setEditing(null);
          }}
        />
      )}
    </>
  );
}
