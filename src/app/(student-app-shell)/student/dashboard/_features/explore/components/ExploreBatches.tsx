import { ExploreBatchCard } from "./ExploreBatchCard";
import { SectionError } from "@/src/components/system/SectionError";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import type { ExploreBatch } from "@/src/app/api/explore-batches/types";
import { getExploreBatchesService } from "@/src/lib/services/batches/get-explore-batches";
import { Link } from "@/src/components/ui/link";

export async function ExploreBatches() {
  let batches: ExploreBatch[] | null = null;
  let fetchError = false;

  try {
    const supabase = await createServerSupabaseClient();

    batches = await getExploreBatchesService(supabase);
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <SectionError
        title="Failed to load batches"
        message="We couldn’t fetch available batches right now."
      />
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No batches available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <ExploreBatchCard key={batch.id} batch={batch} />
        ))}
      </div>
      {/*  View All CTA */}
      <div className="flex justify-center">
        <Link
          href="/batches"
          className="group inline-flex items-center gap-3 rounded-xl border bg-muted/40 px-5 py-3 text-sm font-medium transition hover:bg-muted"
        >
          <span>View all batches</span>
        </Link>
      </div>
    </div>
  );
}
