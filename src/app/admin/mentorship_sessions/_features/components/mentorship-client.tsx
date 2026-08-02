"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";

import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";

import { useInstructorOptions } from "@/src/hooks/use-instructor-options";

import { DEFAULT_MENTORSHIP_FILTERS } from "../constants/mentorship-filters";

import { useMentorshipSessions } from "../hooks/use-mentorship-sessions";

import { useEnrollmentBatchOptions } from "@/src/app/admin/enrollments/_features/hooks/use-enrollment-batch-options";
import { MentorshipFiltersBar } from "./filter/mentorship-filter-bar";
import { MentorshipPageHeader } from "./mentorship-page-header";
import { MentorshipSessionsTable } from "./mentorship-sessions-table";
import { mentorshipQueryKeys } from "../constants/query-keys";

interface MentorshipClientProps {
  isAdmin: boolean;
  mentorshipSessionsEnabled: boolean;
  currentUserId: string;
}

export function MentorshipClient({
  isAdmin,
  mentorshipSessionsEnabled,
  currentUserId,
}: MentorshipClientProps) {
  const [filters, setFilters] = useState(DEFAULT_MENTORSHIP_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isFetching, error, refetch } =
    useMentorshipSessions(filters);

  const { data: batches = [], isLoading: isBatchesLoading } =
    useEnrollmentBatchOptions();

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions();

  const hasActiveFilters =
    filters.search !== DEFAULT_MENTORSHIP_FILTERS.search ||
    filters.batchId !== DEFAULT_MENTORSHIP_FILTERS.batchId ||
    filters.status !== DEFAULT_MENTORSHIP_FILTERS.status ||
    filters.audienceType !== DEFAULT_MENTORSHIP_FILTERS.audienceType ||
    filters.createdBy !== DEFAULT_MENTORSHIP_FILTERS.createdBy;

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
      <MentorshipPageHeader
        isAdmin={isAdmin}
        mentorshipSessionsEnabled={mentorshipSessionsEnabled}
        isFetching={isFetching}
        queryKey={mentorshipQueryKeys.lists()}
      />

      <MentorshipFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
        batches={batches}
        isBatchesLoading={isBatchesLoading}
        instructors={instructors}
        isInstructorsLoading={isInstructorsLoading}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
      />

      {isLoading ? (
        <>
          <TableSkeleton rows={4} columns={7} showTableHeader />
        </>
      ) : !data || data.data.length === 0 ? (
        // Replace with your MentorshipEmptyState once created.
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No mentorship sessions match the selected filters."
              : "No mentorship sessions found."}
          </p>
        </div>
      ) : (
        <>
          <div className={cn(isFetching && "opacity-60")}>
            <MentorshipSessionsTable sessions={data.data} />
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={data.pageSize}
            onPageChange={(page) =>
              setFilters((previous) => ({
                ...previous,
                page,
              }))
            }
          />
        </>
      )}
    </>
  );
}
