"use client";

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

import { AttendanceBatchOption } from "../../types/attendance";

type AttendanceHistoryFiltersProps = {
  batches: AttendanceBatchOption[];

  batchId?: string;

  period: "today" | "custom";

  startDate?: string;

  endDate?: string;

  onBatchChange: (value: string) => void;

  onPeriodChange: (value: "today" | "custom") => void;

  onStartDateChange: (value: string) => void;

  onEndDateChange: (value: string) => void;

  onApply: () => void;
};

export function AttendanceHistoryFilters({
  batches,
  batchId,
  period,
  startDate,
  endDate,
  onBatchChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: AttendanceHistoryFiltersProps) {
  return (
    <Card className="max-w-2xl border-border/60">
      <CardContent className="space-y-5 p-4 md:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium">Batch</label>

            <Select value={batchId} onValueChange={onBatchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
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

            <div className="flex gap-2">
              <Toggle
                pressed={period === "today"}
                onPressedChange={() => onPeriodChange("today")}
                variant="outline"
                className="px-4"
              >
                Today
              </Toggle>

              <Toggle
                pressed={period === "custom"}
                onPressedChange={() => onPeriodChange("custom")}
                variant="outline"
                className="px-4"
              >
                Custom Range
              </Toggle>
            </div>
          </div>
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
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">To Date</label>

              <Input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onApply} disabled={!batchId}>
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
