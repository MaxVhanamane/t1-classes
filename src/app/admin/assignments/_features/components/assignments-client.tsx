"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import DottedBackground from "@/src/components/dotted-background";

// Assuming this is your standard path for the active batches hook
import { useActiveBatchOptions } from "@/src/hooks/use-active-batch-options";
import { BatchAssignmentsManager } from "./batch-assignments-manager";

export function AssignmentsClient() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Fetch only active batches for assignment purposes
  const { data: batches = [], isLoading: isLoadingBatches } =
    useActiveBatchOptions();

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto pb-24">
      {/* Header & Select */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            Batch Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Select an active batch to distribute and schedule homework
            materials.
          </p>
        </div>

        <div className="w-full md:w-[320px]">
          {isLoadingBatches ? (
            <Skeleton className="flex items-center h-9 w-full rounded-lg px-4 border border-border/60">
              <span className="text-muted-foreground text-sm">
                Loading active batches...
              </span>
            </Skeleton>
          ) : (
            <Select
              value={selectedBatchId ?? ""}
              onValueChange={setSelectedBatchId}
            >
              <SelectTrigger className="w-full bg-background border-border/60 shadow-none rounded-lg text-base">
                <SelectValue placeholder="Select a batch..." />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem
                    key={batch.id}
                    value={batch.id}
                    className="py-2.5"
                  >
                    {batch.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Dashboard Canvas */}
      <div className="mt-8 animate-in fade-in duration-500">
        {!selectedBatchId ? (
          <div className="flex flex-col items-center justify-center py-32 text-center fade-in border border-border border-dashed rounded-xl bg-card relative overflow-hidden">
            <DottedBackground />
            <div className="bg-muted-soft p-5 rounded-2xl border border-border/40 mb-5 z-10">
              <ClipboardList className="size-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground tracking-tight z-10">
              No Batch Selected
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2 leading-relaxed z-10">
              Select a batch from the dropdown above to view its current
              timeline and assign new homework.
            </p>
          </div>
        ) : (
          /* Render our dedicated Assignment Manager component once a batch is chosen */
          <BatchAssignmentsManager batchId={selectedBatchId} />
        )}
      </div>
    </div>
  );
}
