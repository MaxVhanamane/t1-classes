"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";

import { Separator } from "@/src/components/ui/separator";
import { BackLink } from "@/src/components/ui/navigation/back-link";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import { Button } from "@/src/components/ui/button";
import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";

import { useDistributionResults } from "../hooks/use-distribution-results";
import { useDistributionResultsSummary } from "../hooks/use-distribution-results-summary";

import { ResultsToolbar } from "./results-toolbar";
import { ResultsTable } from "./results-table";
import { ResultsSummaryCards } from "./results-summary-cards";
import { ResultsSort } from "../types/results.types";

import { fetchAllResultsForExport } from "../actions/export.actions";
import { exportResultsToPDF } from "../functions/export-pdf";

export function ResultsClient() {
  const params = useParams<{
    distributionId: string;
  }>();

  const distributionId = params.distributionId;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ResultsSort>("rank");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // State for the PDF Export
  const [isExporting, setIsExporting] = useState(false);

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

  // Export Handler
  const handleExport = async () => {
    if (!summary?.testTitle) return;

    try {
      setIsExporting(true);

      const { data: exportData, error } =
        await fetchAllResultsForExport(distributionId);

      if (error || !exportData) {
        throw new Error(error || "Failed to fetch data for export");
      }

      // Call the utility to generate and download the PDF
      exportResultsToPDF(
        summary.testTitle,
        "Batch Performance Report", // Update if you fetch actual batch name
        exportData,
      );
    } catch (err) {
      console.error("Export failed:", err);
      // Optional: Trigger a toast notification here
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (error instanceof Error || summaryError instanceof Error) {
    return (
      <ErrorStateCard
        message="Failed to load results."
        onRetry={() => {
          void Promise.all([refetch(), refetchSummary()]);
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-8xl space-y-6 p-4 md:p-6">
      <BackLink
        label="Back To Distributions"
        href="/admin/tests/distributions"
      />

      {/* HEADER: Flex layout for responsive button positioning */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {summary?.testTitle ?? "Test Results"}
          </h1>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || isSummaryLoading}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          {isExporting ? (
            <LoadingIndicator className="mr-2 h-4 w-4 text-white" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? "Generating PDF..." : "Export PDF"}
        </Button>
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
          <ResultsTable
            items={data.items}
            isFetching={isFetching}
            batchId={summary?.batchId}
            isSummaryLoading={isSummaryLoading}
          />
          <div className="min-h-6">
            {isFetching && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoadingIndicator className="size-4" />
                Fetching results...
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
