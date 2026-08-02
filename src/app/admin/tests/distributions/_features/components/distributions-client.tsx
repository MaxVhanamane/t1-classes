"use client";

import { useState } from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { Separator } from "@/src/components/ui/separator";

import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";

import { useInstructorOptions } from "@/src/hooks/use-instructor-options";

import { cn } from "@/src/lib/utils";

import { DEFAULT_DISTRIBUTION_FILTERS } from "../constants/distribution-filters.constants";

import { useDistributions } from "../hooks/use-distributions";

import { DistributionFiltersBar } from "./filter/distributions-filter-bar";
import { DistributionRowCard } from "./distribution-row-card";
import { DistributionListSkeleton } from "./distribution-list-skeleton";

export function DistributionsClient() {
  const [filters, setFilters] = useState(DEFAULT_DISTRIBUTION_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isFetching, error, refetch } =
    useDistributions(filters);

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions();

  const hasActiveFilters =
    filters.search !== DEFAULT_DISTRIBUTION_FILTERS.search ||
    filters.createdBy !== DEFAULT_DISTRIBUTION_FILTERS.createdBy ||
    filters.status !== DEFAULT_DISTRIBUTION_FILTERS.status;

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
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/tests"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Tests
        </Link>

        <Button asChild variant="outline">
          <Link href="/admin/tests/schedule">Scheduled Tests</Link>
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Test Distributions
        </h1>

        <p className="text-sm text-muted-foreground">
          Monitor scheduled, ongoing, and completed test assignments.
        </p>
      </header>

      <Separator />

      <DistributionFiltersBar
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
          <DistributionListSkeleton count={5} />
        </>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h3 className="font-medium">No distributions found</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your filters or search criteria."
              : "No test distributions are available."}
          </p>

          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchInput("");

                setFilters(DEFAULT_DISTRIBUTION_FILTERS);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "space-y-3 transition-opacity duration-200",
            isFetching && "opacity-50",
          )}
        >
          {data.items.map((distribution) => (
            <DistributionRowCard key={distribution.id} item={distribution} />
          ))}

          <div className="min-h-8">
            {isFetching && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoadingIndicator className="size-4" />
                Loading distributions...
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
