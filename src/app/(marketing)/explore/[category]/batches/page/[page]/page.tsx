"use cache";
import { notFound } from "next/navigation";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { CATEGORY_LABELS } from "@/src/app/admin/batches/_features/zod-schema/schema";
import { ExploreBatchCard } from "@/src/app/student/dashboard/_features/components/explore/components/ExploreBatchCard";
import { SectionError } from "@/src/components/system/SectionError";
import { Link } from "@/src/components/ui/link";
import type { ExploreBatch } from "@/src/app/api/explore-batches/types";

// export const dynamic = "force-static";
const LIMIT = 10;

type Params = Promise<{
  category: string;
  page: string;
}>;

/* -------------------------------------------------------------------------- */
/* Static Params                                                              */
/* -------------------------------------------------------------------------- */
export async function generateStaticParams() {
  const supabase = createStaticSupabaseClient();

  const params: { category: string; page: string }[] = [];

  for (const category of Object.keys(CATEGORY_LABELS)) {
    const { count, error } = await supabase
      .from("batches")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("category", category);

    if (error) {
      // Still push a fallback so we never return []
      params.push({ category, page: "1" });
      continue;
    }

    const totalPages = Math.max(1, Math.ceil((count ?? 0) / LIMIT));

    for (let i = 1; i <= totalPages; i++) {
      params.push({ category, page: String(i) });
    }
  }

  // Final safety net in case CATEGORY_LABELS itself is empty
  if (params.length === 0) {
    return [
      { category: Object.keys(CATEGORY_LABELS)[0] ?? "general", page: "1" },
    ];
  }

  return params;
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */
export async function generateMetadata({ params }: { params: Params }) {
  const { category, page } = await params;

  const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];

  if (!label) return {};

  const isFirstPage = page === "1";

  const title = isFirstPage
    ? `${label} Batches | Live Classes, Tests & Full Preparation`
    : `${label} Batches – Page ${page} | Live Classes & Tests`;

  const description = isFirstPage
    ? `Explore ${label} batches with live classes, structured learning, tests, and complete exam preparation guidance.`
    : `Browse page ${page} of ${label} batches with live classes and structured preparation.`;

  const url = isFirstPage
    ? `/explore/${category}/batches`
    : `/explore/${category}/batches/page/${page}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function CategoryBatchesPaginatedPage({
  params,
}: {
  params: Params;
}) {
  console.log("Batches pagination page rendered");
  const { category, page } = await params;

  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return notFound();
  }

  const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];

  if (!label) {
    return notFound();
  }

  const supabase = createStaticSupabaseClient();

  let batches: ExploreBatch[] = [];
  let totalPages = 1;
  let hasError = false;

  try {
    const { data, error } = await supabase.rpc(
      "get_explore_batches_public_by_category", //  your RPC
      {
        p_category: category,
        p_limit: LIMIT,
        p_offset: (pageNumber - 1) * LIMIT,
      },
    );

    if (error) {
      hasError = true;
    } else {
      batches = (data ?? []) as ExploreBatch[];
    }

    if (!hasError) {
      const { count, error: countError } = await supabase
        .from("batches")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("category", category);

      if (countError) {
        hasError = true;
      } else {
        totalPages = Math.max(1, Math.ceil((count ?? 0) / LIMIT));
      }
    }
  } catch {
    hasError = true;
  }

  if (!hasError && pageNumber > totalPages) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background mb-10 ">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 ">
        <header className="mb-10 space-y-3">
          <h1 className="text-2xl font-semibold sm:text-3xl tracking-tight">
            {label} Batches
          </h1>

          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {getBatchSubtitle(label, category)}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Live Classes
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Weekly Tests
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Structured Preparation
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Full Guidance
            </span>
          </div>
        </header>

        {hasError ? (
          <SectionError
            title="Failed to load batches"
            message="Please try again later."
          />
        ) : batches.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No batches available.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => (
                <ExploreBatchCard key={batch.id} batch={batch} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2 flex-wrap">
                {pageNumber > 1 && (
                  <Link
                    href={`/explore/${category}/batches/page/${pageNumber - 1}`}
                    className="border px-3 py-1 text-sm rounded-md"
                  >
                    Prev
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => {
                  const p = i + 1;

                  return (
                    <Link
                      key={p}
                      href={`/explore/${category}/batches/page/${p}`}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        p === pageNumber
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}

                {pageNumber < totalPages && (
                  <Link
                    href={`/explore/${category}/batches/page/${pageNumber + 1}`}
                    className="border px-3 py-1 text-sm rounded-md"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subtitle Helper                                                            */
/* -------------------------------------------------------------------------- */
function getBatchSubtitle(label: string, category: string) {
  switch (category) {
    case "boards":
      return `Join structured ${label} batches with guided teaching, regular tests, and complete syllabus coverage.`;

    case "neet":
    case "jee":
    case "cet":
    case "gate":
      return `Prepare for ${label} with live classes, test series, and expert guidance in a structured batch format.`;

    case "foundation":
      return `Build strong fundamentals with guided batches, live teaching, and regular assessments.`;

    case "nmms":
    case "scholarship":
      return `Prepare for ${label} exams with guided batches, practice tests, and concept-focused teaching.`;

    default:
      return `Structured batches with live classes, tests, and guided preparation for better results.`;
  }
}
