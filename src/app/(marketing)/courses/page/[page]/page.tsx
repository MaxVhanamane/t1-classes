import { ExploreCourse } from "@/src/app/api/explore-batches/types";
import { SectionError } from "@/src/components/system/SectionError";
import { Link } from "@/src/components/ui/link";
import { notFound } from "next/navigation";
import { ExploreCourseCard } from "@/src/app/(student-app-shell)/student/dashboard/_features/explore/components/ExploreCourseCard";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";

export const dynamic = "force-static";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNumber = Number(page);

  return {
    title: `Courses for Class 8–12 & Exams – Page ${pageNumber}`,
    description: `Browse academic and competitive exam courses (NEET, JEE, CET, NMMS). Page ${pageNumber} of available courses with structured learning and practice.`,
  };
}
const LIMIT = 15;

/* -------------------------------------------------------------------------- */
/*  Generate all pages at build time                                        */
/* -------------------------------------------------------------------------- */
export async function generateStaticParams() {
  const supabase = createStaticSupabaseClient();

  const { count, error } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error || !count) {
    return [];
  }

  const totalPages = Math.ceil(count / LIMIT);

  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2), // page 2 onwards
  }));
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                          */
/* -------------------------------------------------------------------------- */
export default async function CoursesPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const pageNumber = Number((await params).page);

  if (isNaN(pageNumber) || pageNumber < 2) {
    return notFound();
  }

  const supabase = createStaticSupabaseClient();

  let courses: ExploreCourse[] = [];
  let hasError = false;
  let totalPages = 1;

  try {
    /* Fetch courses */
    const { data, error } = await supabase.rpc("get_explore_courses_public", {
      p_limit: LIMIT,
      p_offset: (pageNumber - 1) * LIMIT,
    });

    if (error) {
      console.error(error);
      hasError = true;
    } else {
      courses = (data ?? []) as ExploreCourse[];
    }

    /* Fetch total count */
    const { count } = await supabase
      .from("courses")
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
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore Courses
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse all available courses and start learning at your own pace
          </p>
        </div>

        {/* Error */}
        {hasError ? (
          <SectionError
            title="Failed to load courses"
            message="We couldn’t fetch courses right now."
          />
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No courses available.
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <ExploreCourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {/* Prev */}
              {pageNumber > 1 && (
                <Link
                  href={
                    pageNumber === 2
                      ? "/courses"
                      : `/courses/page/${pageNumber - 1}`
                  }
                  className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
                >
                  ← Prev
                </Link>
              )}

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                const href = page === 1 ? "/courses" : `/courses/page/${page}`;

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
                  href={`/courses/page/${pageNumber + 1}`}
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
