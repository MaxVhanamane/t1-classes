import { notFound } from "next/navigation";
import { BatchMetaBadges } from "@/src/components/ui/common/batch-meta-badges";
import { BatchInfoPopover } from "./_features/components/batch-info-popover";
import { getBatchDetails } from "@/src/lib/services/batches/get-batch-details";
import { BatchDetailsResponse } from "@/src/types/batches.types";
import BatchTabsClient from "./_features/components/batch-tabs-client";

type Props = {
  params: Promise<{ batchId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function BatchPage({ params, searchParams }: Props) {
  const { batchId } = await params;
  const { tab } = await searchParams;

  let data: BatchDetailsResponse;

  try {
    data = await getBatchDetails(batchId);
  } catch {
    notFound();
  }

  const { batch, courses } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        {/* Header */}
        <header className="mb-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {batch.title}
            </h1>

            <BatchInfoPopover
              start_date={batch.start_date}
              end_date={batch.end_date}
            />
          </div>

          <BatchMetaBadges batch={{ ...batch }} />
        </header>

        <BatchTabsClient
          batchId={batch.id}
          courses={courses}
          initialTab={tab}
        />
      </div>
    </div>
  );
}
