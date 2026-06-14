"use client";

import { useState } from "react";

import { Separator } from "@/src/components/ui/separator";
import { BackLink } from "@/src/components/ui/navigation/back-link";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

import { BatchTestsErrorState } from "@/src/app/student/learn/batches/[batchId]/_features/components/tests/batch-tests-error-state";

import { useDistributionResults } from "../hooks/use-distribution-results";

import { ResultsToolbar } from "./results-toolbar";
import { ResultsTable } from "./results-table";
import { ResultsSummaryCards } from "./results-summary-cards";

import { ResultsSort } from "../types/results.types";
import { useDistributionResultsSummary } from "../hooks/use-distribution-results-summary";
import { useParams } from "next/navigation";

export function ResultsClient() {
  const params = useParams<{
    distributionId: string;
  }>();

  const distributionId = params.distributionId;
  const [search, setSearch] = useState("");

  const [sort, setSort] = useState<ResultsSort>("rank");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(25);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useDistributionResultsSummary(distributionId);

  const { data, isLoading, isFetching, error, refetch } =
    useDistributionResults({
      distributionId,
      page,
      pageSize,
      search,
      sort,
    });

  if (error instanceof Error || summaryError instanceof Error) {
    return (
      <BatchTestsErrorState
        message="Failed to load results."
        onRetry={() => {
          void Promise.all([refetch(), refetchSummary()]);
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <BackLink
        label="Back To Distributions"
        href="/admin/tests/distributions"
      />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {summary?.testTitle ?? "Test Results"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Distribution ID: {distributionId}
        </p>
      </header>

      <Separator />

      <ResultsSummaryCards summary={summary} isLoading={isSummaryLoading} />

      <Separator />

      <ResultsToolbar
        search={search}
        sort={sort}
        pageSize={pageSize}
        onSearch={(value) => {
          setPage(1);

          setSearch(value);
        }}
        onSort={(value) => {
          setPage(1);

          setSort(value);
        }}
        onPageSize={(value) => {
          setPage(1);

          setPageSize(value);
        }}
      />

      {isLoading ? (
        <ResultsTable.Skeleton />
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h3 className="font-medium">No results found</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ResultsTable items={data.items} isFetching={isFetching} />
          <div className="min-h-6">
            {isFetching && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoadingIndicator className="size-4" />
                Updating results...
              </div>
            )}
          </div>
          <Pagination
            page={data.page}
            totalPages={Math.max(1, Math.ceil(data.total / data.pageSize))}
            totalCount={data.total}
            pageSize={data.pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
