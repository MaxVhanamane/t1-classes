"use client";

import { useMemo, useState } from "react";

import { Loader } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import { useAttendanceBatchReport } from "../../hooks/use-attendance-batch-report";

import { AttendanceEmptyState } from "../shared/attendance-empty-state";

import { BatchReportFilters } from "./batch-report-filters";
import { BatchReportSummary } from "./batch-report-summary";
import { BatchReportStudentList } from "./batch-report-student-list";

export function BatchReportView() {
  const [batchId, setBatchId] = useState("");

  const [search, setSearch] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");

  const [period, setPeriod] = useState<"today" | "custom">("today");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);

  const [appliedFilters, setAppliedFilters] = useState<{
    batchId: string;
    startDate?: string;
    endDate?: string;
  }>();

  const pageSize = 20;

  const reportFilters = useMemo(() => {
    if (!appliedFilters) {
      return null;
    }

    return {
      batchId: appliedFilters.batchId,
      search: appliedSearch || undefined,
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      page,
      pageSize,
    };
  }, [appliedFilters, appliedSearch, page]);

  const {
    data: report,
    isLoading,
    isFetching,
  } = useAttendanceBatchReport(
    reportFilters ?? {
      batchId: "",
      page: 1,
      pageSize,
    },
  );

  function handleBatchChange(value: string) {
    setBatchId(value);
    setPage(1);
  }

  function handlePeriodChange(value: "today" | "custom") {
    setPeriod(value);
  }

  function handleApply() {
    if (!batchId) {
      return;
    }

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    setAppliedFilters({
      batchId,
      startDate: period === "today" ? today : startDate || undefined,
      endDate: period === "today" ? today : endDate || undefined,
    });

    setAppliedSearch(search.trim());

    setPage(1);
  }

  const hasResults = !!report && report.items.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <BatchReportFilters
          search={search}
          batchId={batchId}
          period={period}
          startDate={startDate}
          endDate={endDate}
          isPending={isLoading || isFetching}
          onSearchChange={setSearch}
          onBatchChange={handleBatchChange}
          onPeriodChange={handlePeriodChange}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApply}
        />

        <div className="h-full">
          {hasResults && <BatchReportSummary summary={report.summary} />}
        </div>
      </div>

      {appliedFilters && isLoading && (
        <div className="flex h-40 items-center justify-center ">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader className="h-4 w-4 animate-spin" />
            Loading batch report...
          </div>
        </div>
      )}

      {appliedFilters &&
        !isLoading &&
        !isFetching &&
        report &&
        report.items.length === 0 && (
          <AttendanceEmptyState
            title="No Report Data"
            description="No attendance records were found for the selected filters."
          />
        )}

      {hasResults && !isLoading && !isFetching && (
        <>
          <BatchReportStudentList students={report.items} />

          {report.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>

              <p className="text-muted-foreground text-sm">
                Page {page} of {report.totalPages}
              </p>

              <Button
                variant="outline"
                disabled={page >= report.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
