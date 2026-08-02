"use client";

import { useState } from "react";

import { cn } from "@/src/lib/utils";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";

import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";

import { useEnrollmentBatchOptions } from "@/src/app/admin/enrollments/_features/hooks/use-enrollment-batch-options";

import { useInstructorOptions } from "@/src/hooks/use-instructor-options";

import { DEFAULT_GROUP_SESSION_FILTERS } from "../constants/group-session-filters";

import { useGroupSessions } from "../hooks/use-group-sessions";

import { GroupSessionFiltersBar } from "./filter/group-session-filters-bar";
import { GroupSessionsPageHeader } from "./group-sessions-page-header";
import { GroupSessionsTable } from "./group-sessions-table";
import { useAuthClaims } from "@/src/lib/auth/claims/hooks/use-auth-claims";
import { groupSessionsQueryKeys } from "../constants/query-keys";

export function GroupSessionsPageClient() {
  const [filters, setFilters] = useState(DEFAULT_GROUP_SESSION_FILTERS);

  const [searchInput, setSearchInput] = useState("");
  const { data: auth, isLoading: isAuthLoading } = useAuthClaims();

  const currentUserId = auth?.userId ?? "";

  const isAdmin = auth?.role === "admin";

  const { data, isLoading, isFetching, error, refetch } =
    useGroupSessions(filters);

  const { data: batches = [], isLoading: isBatchesLoading } =
    useEnrollmentBatchOptions();

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions({
      enabled: isAdmin,
    });

  const hasActiveFilters =
    filters.search !== DEFAULT_GROUP_SESSION_FILTERS.search ||
    filters.batchId !== DEFAULT_GROUP_SESSION_FILTERS.batchId ||
    filters.status !== DEFAULT_GROUP_SESSION_FILTERS.status ||
    filters.audienceType !== DEFAULT_GROUP_SESSION_FILTERS.audienceType ||
    filters.createdBy !== DEFAULT_GROUP_SESSION_FILTERS.createdBy;

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
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <GroupSessionsPageHeader
        isFetching={isFetching}
        queryKey={groupSessionsQueryKeys.lists()}
      />

      <GroupSessionFiltersBar
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
        isAuthLoading={isAuthLoading}
      />

      {isLoading ? (
        <>
          <TableSkeleton rows={4} columns={7} showTableHeader />
        </>
      ) : !data || data.data.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No group sessions match the selected filters."
              : "No group sessions found."}
          </p>
        </div>
      ) : (
        <>
          <div className={cn(isFetching && "opacity-60")}>
            <GroupSessionsTable sessions={data.data} />
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
    </div>
  );
}
