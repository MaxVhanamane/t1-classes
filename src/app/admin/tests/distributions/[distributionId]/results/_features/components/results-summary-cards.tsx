"use client";

import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

import { DistributionResultsSummary } from "../types/results.types";

interface Props {
  summary?: DistributionResultsSummary;
  isLoading?: boolean;
}

export function ResultsSummaryCards({ summary, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <StatCard label="Participants" value={summary?.participants} />

      <StatCard label="Submitted" value={summary?.submitted} />

      <StatCard label="In Progress" value={summary?.inProgress} />

      <StatCard label="Expired" value={summary?.expired} />

      <StatCard
        label="Average Score"
        value={
          summary?.averageScore !== null && summary?.averageScore !== undefined
            ? Number(summary.averageScore).toFixed(2)
            : undefined
        }
      />

      <StatCard
        label="Top Score"
        value={
          summary?.topScore !== null && summary?.topScore !== undefined
            ? Number(summary.topScore).toFixed(2)
            : undefined
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>

      <div className="mt-1 text-2xl font-semibold">{value ?? "—"}</div>
    </Card>
  );
}
