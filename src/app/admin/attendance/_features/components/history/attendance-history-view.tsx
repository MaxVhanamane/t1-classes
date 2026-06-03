"use client";

import { useMemo, useState } from "react";

import { Button } from "@/src/components/ui/button";

import { AttendanceHistoryFilters } from "./attendance-history-filters";
import { AttendanceHistoryList } from "./attendance-history-list";
import { AttendanceSessionSheet } from "./attendance-session-sheet";

import { AttendanceEmptyState } from "../shared/attendance-empty-state";

import { useAttendanceBatches } from "../../hooks/use-attendance-batches";
import { useAttendanceHistory } from "../../hooks/use-attendance-history";
import { Loader } from "lucide-react";

export function AttendanceHistoryView() {
  const [batchId, setBatchId] = useState<string>();

  const [period, setPeriod] = useState<"today" | "custom">("today");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<{
    batchId: string;
    startDate?: string;
    endDate?: string;
  }>();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [page, setPage] = useState(1);

  const pageSize = 10;

  const { data: batches = [] } = useAttendanceBatches();

  const historyFilters = useMemo(() => {
    if (!appliedFilters) {
      return {
        page,
        pageSize,
      };
    }

    return {
      ...appliedFilters,

      page,

      pageSize,
    };
  }, [appliedFilters, page, pageSize]);

  const { data: history, isLoading } = useAttendanceHistory(historyFilters, {
    enabled: !!appliedFilters,
  });

  function handleBatchChange(value: string) {
    setBatchId(value);
  }

  function handlePeriodChange(value: "today" | "custom") {
    setPeriod(value);
  }

  function handleApplyFilters() {
    if (!batchId) {
      return;
    }

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    setPage(1);

    setAppliedFilters({
      batchId,

      startDate: period === "today" ? today : startDate || undefined,

      endDate: period === "today" ? today : endDate || undefined,
    });
  }

  function handleViewSession(sessionId: string) {
    setSelectedSessionId(sessionId);

    setIsSheetOpen(true);
  }

  if (!appliedFilters) {
    return (
      <div className="space-y-6">
        <AttendanceHistoryFilters
          batches={batches}
          batchId={batchId}
          period={period}
          startDate={startDate}
          endDate={endDate}
          onBatchChange={handleBatchChange}
          onPeriodChange={handlePeriodChange}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApplyFilters}
        />
      </div>
    );
  }

  if (!isLoading && history && history.items.length === 0) {
    return (
      <div className="space-y-6">
        <AttendanceHistoryFilters
          batches={batches}
          batchId={batchId}
          period={period}
          startDate={startDate}
          endDate={endDate}
          onBatchChange={handleBatchChange}
          onPeriodChange={handlePeriodChange}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApplyFilters}
        />
        <div className="max-w-2xl">
          <AttendanceEmptyState
            title="No Sessions Found"
            description="No attendance sessions were found for the selected filters."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceHistoryFilters
        batches={batches}
        batchId={batchId}
        period={period}
        startDate={startDate}
        endDate={endDate}
        onBatchChange={handleBatchChange}
        onPeriodChange={handlePeriodChange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={handleApplyFilters}
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader className="h-4 w-4 animate-spin" />
            Loading attendance history...
          </div>
        </div>
      ) : (
        <>
          <AttendanceHistoryList
            sessions={history?.items ?? []}
            onView={handleViewSession}
          />

          {history && history.totalPages > 1 && (
            <div className="flex max-w-2xl items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>

              <p className="text-muted-foreground text-sm">
                Page {page} of {history.totalPages}
              </p>

              <Button
                variant="outline"
                disabled={page >= history.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <AttendanceSessionSheet
        sessionId={selectedSessionId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
