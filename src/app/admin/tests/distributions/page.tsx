import { Separator } from "@/src/components/ui/separator";

import { DistributionsList } from "./_features/components/distributions-list";
import { DistributionsToolbar } from "./_features/components/distributions-toolbar";

type Props = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
};

export default async function DistributionsPage({ searchParams }: Props) {
  const params = await searchParams;

  const status = params.status ?? "all";
  const search = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Test Distributions
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor scheduled, ongoing, and completed test assignments
        </p>
      </header>

      <Separator />

      {/* CLIENT UI */}
      <DistributionsToolbar status={status} search={search} />

      {/* SERVER DATA */}
      <DistributionsList status={status} search={search} page={page} />
    </div>
  );
}
