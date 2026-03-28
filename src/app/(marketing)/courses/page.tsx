import { ExploreCourse } from "@/src/app/api/explore-batches/types";
import { Link } from "@/src/components/ui/link";
import { ExploreCourseCard } from "../../(student-app-shell)/student/dashboard/_features/explore/components/ExploreCourseCard";
import { SectionError } from "@/src/components/system/SectionError";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";

export const dynamic = "force-static";

export const metadata = {
  title: "Online Courses for Class 8–12, NEET, JEE & More",
  description:
    "Explore academic courses for Class 8–12 and competitive exams like NEET, JEE, CET, and NMMS.",
};

export default async function CoursesPage() {
  const supabase = createStaticSupabaseClient();
  const LIMIT = 15;

  let courses: ExploreCourse[] = [];
  let hasError = false;
  let hasNextPage = false;

  try {
    const { data, error } = await supabase.rpc("get_explore_courses_public", {
      p_limit: LIMIT,
      p_offset: 0,
    });

    if (error) {
      hasError = true;
    } else {
      courses = (data ?? []) as ExploreCourse[];
    }

    if (!hasError) {
      const { count } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      hasNextPage = (count ?? 0) > LIMIT;
    }
  } catch (err) {
    console.error(err);
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-background mb-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/*  HERO HEADER */}
        <div className="mb-12 space-y-4 pt-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Courses for Class 8–12 & Competitive Exams
          </h1>

          <p className="max-w-2xl text-muted-foreground sm:text-base">
            Structured learning with chapters, video lessons, PDFs, and
            topic-wise practice tests for exams like NEET, JEE, CET, and NMMS.
          </p>
        </div>

        {/*  Error */}
        {hasError ? (
          <SectionError
            title="Failed to load courses"
            message="We couldn’t fetch courses right now. Please try again later."
          />
        ) : courses.length === 0 ? (
          /*  Empty */
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No courses available right now.
            </p>
          </div>
        ) : (
          <>
            {/*  Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <ExploreCourseCard key={course.id} course={course} />
              ))}
            </div>

            {/*  Pagination */}
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <Link
                  href="/courses/page/2"
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-accent"
                >
                  View more courses
                  <span>→</span>
                </Link>
              </div>
            )}
          </>
        )}

        {/*  Info Section */}
        <div className="mt-20 rounded-xl border bg-muted/40 p-6 sm:p-8">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Learn with Structured Courses
            </h2>

            <p className="text-sm text-muted-foreground">
              Our courses are designed for students from Class 8 to 12 and for
              competitive exams like NEET, JEE, CET, and NMMS. Each course is
              divided into chapters and topics to help you learn step by step.
            </p>

            <p className="text-sm text-muted-foreground">
              Every topic includes video lessons, downloadable PDFs, and
              practice tests with MCQs to reinforce your understanding and
              improve exam performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
