import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getDistributionResultsSummary } from "./_features/actions/get-distribution-results-summary";
import { ResultsToolbar } from "./_features/components/results-toolbar";
import { ResultsTable } from "./_features/components/results-table";
import { ResultsSort } from "./_features/types/results.types";

type Props = {
  params: Promise<{
    distributionId: string;
  }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    size?: string;
  }>;
};

export default async function DistributionResultsPage({
  params,
  searchParams,
}: Props) {
  const sp = await searchParams;
  const { distributionId } = await params;

  const page = Math.max(1, Number(sp.page ?? "1"));
  const size = Math.min(100, Number(sp.size ?? "25"));
  const search = sp.q ?? "";
  const sort = sp.sort ?? "name";

  const summary = await getDistributionResultsSummary(distributionId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Test Results
          </h1>
          <p className="text-sm text-muted-foreground">
            Distribution ID: {distributionId}
          </p>
        </div>

        <Button variant="ghost" asChild>
          <Link href="/admin/tests/distributions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Participants"
          value={summary.participants.toString()}
        />
        <StatCard label="Submitted" value={summary.submitted.toString()} />
        <StatCard
          label="Average Score"
          value={
            summary.averageScore !== null
              ? summary.averageScore.toString()
              : "—"
          }
        />
        <StatCard
          label="Top Score"
          value={summary.topScore !== null ? summary.topScore.toString() : "—"}
        />
      </div>

      <Separator />

      {/* Toolbar */}
      <ResultsToolbar search={search} sort={sort} pageSize={size} />

      {/* Results Table */}
      <ResultsTable
        distributionId={distributionId}
        page={page}
        pageSize={size}
        search={search}
        sort={sort as ResultsSort}
      />
    </div>
  );
}

/* ---------------------------------- */
/* Small UI Helper */
/* ---------------------------------- */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
