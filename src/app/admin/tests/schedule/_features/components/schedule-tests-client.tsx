"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  Layers,
  HelpCircle,
  Trophy,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Link } from "@/src/components/ui/link";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { Separator } from "@/src/components/ui/separator";

import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";
import { useInstructorOptions } from "@/src/hooks/use-instructor-options";
import { cn } from "@/src/lib/utils";
import { useTests } from "@/src/app/admin/tests/_features/hooks/use-tests";

import { DEFAULT_SCHEDULE_FILTERS } from "../constants/schedule-filters.constants";
import { ScheduleFiltersBar } from "./filter/schedule-filters-bar";
import { ScheduleTestDialog } from "./schedule-test-dialog";
import { TestsListSkeleton } from "@/src/app/admin/tests/_features/components/tests-list-skeleton";

export function ScheduleTestsClient() {
  const [filters, setFilters] = useState(DEFAULT_SCHEDULE_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useTests({
    search: filters.search,
    createdBy: filters.createdBy,
    testType: filters.testType,
    locked: "all",
    page: filters.page,
  });

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions();

  const hasActiveFilters =
    filters.search !== DEFAULT_SCHEDULE_FILTERS.search ||
    filters.createdBy !== DEFAULT_SCHEDULE_FILTERS.createdBy ||
    filters.testType !== DEFAULT_SCHEDULE_FILTERS.testType;

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
          <Link href="/admin/tests/distributions">
            View Scheduled Tests & Results
          </Link>
        </Button>
      </div>

      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Schedule Tests
          </h1>
          <p className="text-sm text-muted-foreground">
            Assign tests to batches, courses, or marketing audiences.
          </p>
        </div>
      </header>

      <Separator />

      <ScheduleFiltersBar
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
        <TestsListSkeleton count={4} />
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h3 className="font-medium">No tests found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your filters or search criteria."
              : "No tests are available for scheduling."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchInput("");
                setFilters(DEFAULT_SCHEDULE_FILTERS);
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
          {data.items.map((test) => (
            <Card key={test.id} className="p-4 transition hover:bg-muted/40">
              <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{test.title}</span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {test.test_type}
                    </Badge>
                  </div>

                  {test.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {test.description}
                    </p>
                  )}

                  {/* NEW: Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {test.test_type === "sectioned" && (
                      <div className="flex items-center gap-1.5">
                        <Layers className="size-4 text-sky-500" />
                        <span>
                          {test.total_sections}{" "}
                          {test.total_sections === 1 ? "Section" : "Sections"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="size-4 text-emerald-500" />
                      <span>
                        {test.total_questions}{" "}
                        {test.total_questions === 1 ? "Question" : "Questions"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Trophy className="size-4 text-amber-500" />
                      <span>{test.total_marks} Marks</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span>
                      Created{" "}
                      {new Date(test.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    {test.created_by && (
                      <span>By {test.created_by.full_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex h-full items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedTest(test.id);
                    }}
                  >
                    <CalendarPlus className="size-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </Card>
          ))}

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

      {selectedTest && (
        <ScheduleTestDialog
          testId={selectedTest}
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTest(null);
            }
          }}
        />
      )}
    </div>
  );
}
