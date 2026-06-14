"use client";

import { useState } from "react";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import { CardSkeleton } from "@/src/components/ui/skeleton/table/table-cards-skeleton";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";

import { BatchTestsErrorState } from "@/src/app/student/learn/batches/[batchId]/_features/components/tests/batch-tests-error-state";

import { useInstructorOptions } from "@/src/hooks/use-instructor-options";

import { cn } from "@/src/lib/utils";

import { DEFAULT_TEST_FILTERS } from "../constants/test-filters.constants";

import { useTests } from "../hooks/use-tests";

import { TestsHeader } from "./tests-header";
import { TestFiltersBar } from "./filter/test-filter-bar";
import { TestsList } from "./test-list";
import { TestsEmptyState } from "./test-empty-state";

export function TestsClient() {
  const [filters, setFilters] = useState(DEFAULT_TEST_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isFetching, error, refetch } = useTests(filters);

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions();

  const hasActiveFilters =
    filters.search !== DEFAULT_TEST_FILTERS.search ||
    filters.createdBy !== DEFAULT_TEST_FILTERS.createdBy ||
    filters.testType !== DEFAULT_TEST_FILTERS.testType ||
    filters.locked !== DEFAULT_TEST_FILTERS.locked;

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
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <TestsHeader />

      <TestFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
        instructors={instructors}
        isInstructorsLoading={isInstructorsLoading}
        isAdmin={data?.isAdmin ?? false}
        currentUserId={data?.currentUserId ?? ""}
      />

      {isLoading ? (
        <>
          <TableSkeleton rows={4} columns={5} showTableHeader />

          <CardSkeleton extraFields={2} />
        </>
      ) : !data || data.items.length === 0 ? (
        <TestsEmptyState
          hasFilters={hasActiveFilters}
          onResetFilters={() => {
            setSearchInput("");

            setFilters(DEFAULT_TEST_FILTERS);
          }}
        />
      ) : (
        <div
          className={cn(
            "space-y-3 transition-opacity duration-200",
            isFetching && "opacity-50",
          )}
        >
          <TestsList tests={data.items} />

          <div className="min-h-8">
            {isFetching && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoadingIndicator className="size-4" />
                Loading tests...
              </div>
            )}
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
        </div>
      )}
    </div>
  );
}
