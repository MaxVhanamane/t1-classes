import { Separator } from "@/src/components/ui/separator";
import { ResultsClient } from "./_features/components/results-client";
import { getDistributionResultsSummary } from "./_features/server/get-distribution-results-summary";
import { BackLink } from "@/src/components/ui/navigation/back-link";

type Props = {
  params: Promise<{ distributionId: string }>;
};

export default async function DistributionResultsPage({ params }: Props) {
  const { distributionId } = await params;

  const summary = await getDistributionResultsSummary(distributionId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 space-y-6">
      <BackLink
        label="Back To Distributions"
        href="/admin/tests/distributions"
      ></BackLink>

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
      </div>

      <Separator />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Participants" value={summary.participants} />
        <StatCard label="Submitted" value={summary.submitted} />
        <StatCard label="In Progress" value={summary.inProgress} />
        <StatCard label="Expired" value={summary.expired} />
        <StatCard label="Average Score" value={summary.averageScore ?? "—"} />
        <StatCard label="Top Score" value={summary.topScore ?? "—"} />
      </div>

      <Separator />

      {/* Client results */}
      <ResultsClient distributionId={distributionId} />
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
  const display = value ?? "—";

  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{display}</div>
    </div>
  );
}
