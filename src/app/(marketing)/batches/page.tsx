import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { ExploreBatchCard } from "@/src/app/(student-app-shell)/student/dashboard/_features/explore/components/ExploreBatchCard";
import { SectionError } from "@/src/components/system/SectionError";
import { Link } from "@/src/components/ui/link";
import type { ExploreBatch } from "@/src/app/api/explore-batches/types";

export const dynamic = "force-static";

export default async function BatchesPage() {
  const supabase = createStaticSupabaseClient();

  const LIMIT = 15;

  let batches: ExploreBatch[] = [];
  let hasError = false;
  let hasNextPage = false;

  try {
    /* ---------------- Fetch batches ---------------- */
    const { data, error } = await supabase.rpc("get_explore_batches_public", {
      p_limit: LIMIT,
      p_offset: 0,
    });

    if (error) {
      console.error("RPC error:", error);
      hasError = true;
    } else {
      batches = (data ?? []) as ExploreBatch[];
    }

    /* ---------------- Count ---------------- */
    const { count, error: countError } = await supabase
      .from("batches")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (!countError) {
      hasNextPage = (count ?? 0) > LIMIT;
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    hasError = true;
  }

  if (hasError) {
    return (
      <SectionError
        title="Failed to load batches"
        message="We couldn’t fetch batches right now."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold">Explore Learning Batches</h1>
          <p className="text-muted-foreground">
            Structured programs covering multiple subjects with guided learning.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <ExploreBatchCard key={batch.id} batch={batch} />
          ))}
        </div>

        {/* Pagination */}
        {hasNextPage && (
          <div className="mt-12 flex justify-center">
            <Link
              href="/batches/page/2"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-accent"
            >
              View more batches
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
