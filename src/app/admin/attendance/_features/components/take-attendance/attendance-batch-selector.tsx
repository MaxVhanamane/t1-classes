"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { AttendanceBatchOption } from "../../types/attendance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";

type AttendanceBatchSelectorProps = {
  batches: AttendanceBatchOption[];

  value: string;

  onChange: (value: string) => void;

  onOpen: () => void;

  isLoading: boolean;

  isLoadingBatches: boolean;
};
export function AttendanceBatchSelector({
  batches,
  value,
  onChange,
  onOpen,
  isLoading,
  isLoadingBatches,
}: AttendanceBatchSelectorProps) {
  return (
    <Card className="max-w-2xl border-border/60 shadow-none">
      <CardHeader>
        <CardTitle>Take Attendance</CardTitle>

        <CardDescription>
          Select a batch to create or open today&apos;s attendance session.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Batch</Label>

          <Select
            disabled={isLoadingBatches}
            value={value}
            onValueChange={onChange}
          >
            <SelectTrigger>
              {isLoadingBatches ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />

                  <span>Loading batches...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select a batch" />
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

        <div className="sm:flex sm:justify-end">
          <Button
            disabled={!value || isLoading || isLoadingBatches}
            onClick={onOpen}
            className="w-full sm:min-w-[200px] sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              "Open Attendance"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
