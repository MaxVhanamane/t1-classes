import { notFound } from "next/navigation";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { CATEGORY_LABELS } from "@/src/app/admin/batches/_features/zod-schema/schema";
import { ExploreCourseCard } from "@/src/app/student/dashboard/_features/components/explore/components/ExploreCourseCard";
import { SectionError } from "@/src/components/system/SectionError";
import { Link } from "@/src/components/ui/link";
import type { ExploreCourse } from "@/src/app/api/explore-batches/types";
import { cacheLife, cacheTag } from "next/cache";

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
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("category", category);

    if (error) continue;

    const totalPages = Math.max(1, Math.ceil((count ?? 0) / LIMIT));

    for (let i = 1; i <= totalPages; i++) {
      params.push({ category, page: String(i) });
    }
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
    ? `${label} Online Courses | Video Lectures, Notes & Practice`
    : `${label} Courses – Page ${page} | Video Lectures & Practice`;

  const description = isFirstPage
    ? `Explore ${label} online courses with structured video lectures, downloadable notes, and practice questions. Learn at your own pace and improve your exam performance.`
    : `Browse page ${page} of ${label} courses with video lectures, notes, and practice questions.`;

  const url = isFirstPage
    ? `/explore/${category}/courses`
    : `/explore/${category}/courses/page/${page}`;

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
export default async function CategoryCoursesPaginatedPage({
  params,
}: {
  params: Params;
}) {
  "use cache";
  cacheLife("aggressive");
  console.log("Courses pagination page rendered");
  const { category, page } = await params;
  cacheTag(`course-list-${category}`);

  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return notFound();
  }

  const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];

  if (!label) {
    return notFound();
  }

  const supabase = createStaticSupabaseClient();

  let courses: ExploreCourse[] = [];
  let totalPages = 1;
  let hasError = false;

  try {
    const { data, error } = await supabase.rpc(
      "get_explore_courses_public_by_category",
      {
        p_category: category,
        p_limit: LIMIT,
        p_offset: (pageNumber - 1) * LIMIT,
      },
    );

    if (error) {
      hasError = true;
    } else {
      courses = (data ?? []) as ExploreCourse[];
    }

    if (!hasError) {
      const { count, error: countError } = await supabase
        .from("courses")
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
    <div className="min-h-screen bg-background mb-10">
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <header className="mb-10 space-y-3">
          <h1 className="text-2xl font-semibold sm:text-3xl tracking-tight">
            {label} Courses
          </h1>

          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {getCategorySubtitle(label, category)}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Video Lectures
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Notes & PDFs
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Practice Questions
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Self-Paced Learning
            </span>
          </div>
        </header>

        {hasError ? (
          <SectionError
            title="Failed to load courses"
            message="Please try again later."
          />
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No courses available.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <ExploreCourseCard key={course.id} course={course} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2 flex-wrap">
                {pageNumber > 1 && (
                  <Link
                    href={`/explore/${category}/courses/page/${pageNumber - 1}`}
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
                      href={`/explore/${category}/courses/page/${p}`}
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
                    href={`/explore/${category}/courses/page/${pageNumber + 1}`}
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

function getCategorySubtitle(label: string, category: string) {
  switch (category) {
    case "boards":
      return `Learn ${label} subjects with structured video lessons, clear explanations, and practice questions to build strong concepts.`;

    case "neet":
    case "jee":
    case "cet":
    case "gate":
      return `Prepare for ${label} with concept-focused video lectures, problem-solving practice, and structured learning.`;

    case "foundation":
      return `Build strong fundamentals early with structured lessons, practice, and concept clarity across subjects.`;

    case "nmms":
    case "scholarship":
      return `Prepare for ${label} exams with guided lessons, practice questions, and concept-building exercises.`;

    default:
      return `Structured courses with video lessons, notes, and practice to help you learn effectively.`;
  }
}
