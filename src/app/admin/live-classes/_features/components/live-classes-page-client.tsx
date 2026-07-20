"use client";

import { useState } from "react";

import { cn } from "@/src/lib/utils";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";

import { BatchTestsErrorState } from "@/src/app/student/learn/batches/[batchId]/_features/components/tests/batch-tests-error-state";

import { useEnrollmentBatchOptions } from "@/src/app/admin/enrollments/_features/hooks/use-enrollment-batch-options";

import { useInstructorOptions } from "@/src/hooks/use-instructor-options";

import { useAuthClaims } from "@/src/lib/auth/claims/hooks/use-auth-claims";

import { DEFAULT_LIVE_CLASS_FILTERS } from "../../constants/live-class-filters";

import { useLiveClasses } from "../hooks/use-live-classes";

import type { LiveClass } from "../types/live-class.types";

import { DeleteLiveClassDialog } from "./delete-live-class-dialog";

import { LiveClassFiltersBar } from "./live-class-filter-bar";
import { LiveClassesPageHeader } from "./live-classes-page-header";
import { LiveClassesTable } from "./live-classes-table";
import { LiveClassDialog } from "./live-class-dialog.tsx";
import { liveClassQueryKeys } from "../../constants/query-keys";

export function LiveClassesPageClient() {
  const [filters, setFilters] = useState(DEFAULT_LIVE_CLASS_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedLiveClass, setSelectedLiveClass] = useState<LiveClass | null>(
    null,
  );

  const { data: auth, isLoading: isAuthLoading } = useAuthClaims();

  const currentUserId = auth?.userId ?? "";

  const isAdmin = auth?.role === "admin";

  const { data, isLoading, isFetching, error, refetch } =
    useLiveClasses(filters);

  const { data: batches = [], isLoading: isBatchesLoading } =
    useEnrollmentBatchOptions();

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions({
      enabled: isAdmin,
    });

  const hasActiveFilters =
    filters.search !== DEFAULT_LIVE_CLASS_FILTERS.search ||
    filters.batchId !== DEFAULT_LIVE_CLASS_FILTERS.batchId ||
    filters.status !== DEFAULT_LIVE_CLASS_FILTERS.status ||
    filters.createdBy !== DEFAULT_LIVE_CLASS_FILTERS.createdBy;

  function handleCreate() {
    setSelectedLiveClass(null);
    setOpenDialog(true);
  }

  function handleEdit(liveClass: LiveClass) {
    setSelectedLiveClass(liveClass);
    setOpenDialog(true);
  }

  function handleDelete(liveClass: LiveClass) {
    setSelectedLiveClass(liveClass);
    setOpenDeleteDialog(true);
  }

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
      <div className="mb-10 space-y-6 p-4 md:p-6">
        <LiveClassesPageHeader
          onCreate={handleCreate}
          queryKey={liveClassQueryKeys.lists()}
          isFetching={isFetching}
        />

        <LiveClassFiltersBar
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
          <TableSkeleton rows={4} columns={7} showTableHeader />
        ) : !data || data.data.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "No live classes match the selected filters."
                : "No live classes found."}
            </p>
          </div>
        ) : (
          <>
            <div className={cn(isFetching && "opacity-60")}>
              <LiveClassesTable
                classes={data.data}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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

      <LiveClassDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        liveClass={
          selectedLiveClass
            ? {
                id: selectedLiveClass.id,
                title: selectedLiveClass.title,
                description: selectedLiveClass.description,
                youtube_live_id: selectedLiveClass.youtube_live_id,
                starts_at: selectedLiveClass.starts_at,
                ends_at: selectedLiveClass.ends_at,
                batch_ids: selectedLiveClass.batch_ids,
              }
            : undefined
        }
      />

      <DeleteLiveClassDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        liveClass={selectedLiveClass}
      />
    </>
  );
}
