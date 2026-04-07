import { ExploreCourseCard } from "./ExploreCourseCard";
import { SectionError } from "@/src/components/system/SectionError";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import type { ExploreCourse } from "@/src/app/api/explore-batches/types";
import { getExploreCoursesForUser } from "@/src/lib/services/courses/get-explore-courses-for-user";
import { Link } from "@/src/components/ui/link";

export async function ExploreCourses() {
  let courses: ExploreCourse[] | null = null;
  let fetchError = false;

  try {
    const supabase = await createServerSupabaseClient();

    courses = await getExploreCoursesForUser(supabase, 6);
  } catch {
    fetchError = true;
  }

  /** Render phase */

  if (fetchError) {
    return (
      <SectionError
        title="Failed to load courses"
        message="We couldn’t fetch available courses right now."
      />
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No courses available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <ExploreCourseCard key={course.id} course={course} />
        ))}
      </div>

      {/*  View All CTA */}
      <div className="flex justify-center">
        <Link
          href="/courses"
          className="group inline-flex items-center gap-3 rounded-xl border bg-muted/40 px-5 py-3 text-sm font-medium transition hover:bg-muted"
        >
          <span>View all courses</span>
        </Link>
      </div>
    </div>
  );
}
