import { ExploreBatch } from "@/src/app/api/explore-batches/types";
import { SectionError } from "@/src/components/system/SectionError";
import { Link } from "@/src/components/ui/link";
import { notFound } from "next/navigation";
import { ExploreBatchCard } from "@/src/app/(student-app-shell)/student/dashboard/_features/explore/components/ExploreBatchCard";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";

export const dynamic = "force-static";

const LIMIT = 15;

/* -------------------------------------------------------------------------- */
/*  Metadata                                                               */
/* -------------------------------------------------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNumber = Number(page);

  return {
    title: `Batches for Class 8–12 & Exams – Page ${pageNumber}`,
    description: `Browse structured learning batches for Class 8–12 and exams like NEET, JEE, CET, and NMMS. Page ${pageNumber} of available batches.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Static Params                                                          */
/* -------------------------------------------------------------------------- */
export async function generateStaticParams() {
  const supabase = createStaticSupabaseClient();

  const { count, error } = await supabase
    .from("batches")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error || !count) return [];

  const totalPages = Math.ceil(count / LIMIT);

  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                   */
/* -------------------------------------------------------------------------- */
export default async function BatchesPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const pageNumber = Number((await params).page);

  if (isNaN(pageNumber) || pageNumber < 2) {
    return notFound();
  }

  const supabase = createStaticSupabaseClient();

  let batches: ExploreBatch[] = [];
  let hasError = false;
  let totalPages = 1;

  try {
    /* ---------------- Fetch batches ---------------- */
    const { data, error } = await supabase.rpc("get_explore_batches_public", {
      p_limit: LIMIT,
      p_offset: (pageNumber - 1) * LIMIT,
    });

    if (error) {
      console.error(error);
      hasError = true;
    } else {
      batches = (data ?? []) as ExploreBatch[];
    }

    /* ---------------- Count ---------------- */
    const { count } = await supabase
      .from("batches")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    totalPages = Math.max(1, Math.ceil((count ?? 0) / LIMIT));
  } catch (err) {
    console.error(err);
    hasError = true;
  }

  if (pageNumber > totalPages) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore Learning Batches
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Structured programs covering multiple subjects with guided learning
            for Class 8–12 and exams like NEET, JEE, CET, and NMMS.
          </p>
        </div>

        {/* Error */}
        {hasError ? (
          <SectionError
            title="Failed to load batches"
            message="We couldn’t fetch batches right now."
          />
        ) : batches.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No batches available.
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => (
                <ExploreBatchCard key={batch.id} batch={batch} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {/* Prev */}
              {pageNumber > 1 && (
                <Link
                  href={
                    pageNumber === 2
                      ? "/batches"
                      : `/batches/page/${pageNumber - 1}`
                  }
                  className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
                >
                  ← Prev
                </Link>
              )}

              {/* Pages */}
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                const href = page === 1 ? "/batches" : `/batches/page/${page}`;

                return (
                  <Link
                    key={page}
                    href={href}
                    className={`rounded-md border px-3 py-1 text-sm ${
                      page === pageNumber
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}

              {/* Next */}
              {pageNumber < totalPages && (
                <Link
                  href={`/batches/page/${pageNumber + 1}`}
                  className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
                >
                  Next →
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
