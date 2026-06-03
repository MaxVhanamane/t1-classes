"use client";

import { Loader } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Toggle } from "@/src/components/ui/toggle";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { useAttendanceBatches } from "../../hooks/use-attendance-batches";

type BatchReportFiltersProps = {
  batchId: string;

  period: "today" | "custom";

  startDate?: string;

  endDate?: string;

  search: string;

  isPending: boolean;

  onSearchChange: (value: string) => void;

  onBatchChange: (value: string) => void;

  onPeriodChange: (value: "today" | "custom") => void;

  onStartDateChange: (value: string) => void;

  onEndDateChange: (value: string) => void;

  onApply: () => void;
};

export function BatchReportFilters({
  batchId,
  period,
  startDate,
  endDate,
  search,
  isPending,
  onSearchChange,
  onBatchChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: BatchReportFiltersProps) {
  const { data: batches = [], isLoading: isLoadingBatches } =
    useAttendanceBatches();

  const isDisabled = isPending || isLoadingBatches;

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-5 p-4 md:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium">Batch</label>

            <Select
              value={batchId}
              onValueChange={onBatchChange}
              disabled={isDisabled}
            >
              <SelectTrigger>
                {isLoadingBatches ? (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Loading batches...
                  </div>
                ) : (
                  <SelectValue placeholder="Select batch" />
                )}
              </SelectTrigger>

              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Period</label>

            <div className="flex flex-wrap gap-2">
              <Toggle
                pressed={period === "today"}
                onPressedChange={() => onPeriodChange("today")}
                variant="outline"
                className="px-4"
                disabled={isDisabled}
              >
                Today
              </Toggle>

              <Toggle
                pressed={period === "custom"}
                onPressedChange={() => onPeriodChange("custom")}
                variant="outline"
                className="px-4"
                disabled={isDisabled}
              >
                Custom Range
              </Toggle>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Search Student
          </label>

          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student name or roll number"
            disabled={isDisabled}
          />
        </div>

        {period === "custom" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                From Date
              </label>

              <Input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => onStartDateChange(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">To Date</label>

              <Input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => onEndDateChange(e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onApply}
            disabled={!batchId || isPending || isLoadingBatches}
            className="min-w-[140px]"
          >
            {isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "View Report"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
