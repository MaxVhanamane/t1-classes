import { ExploreCourseCard } from "./ExploreCourseCard";
import { SectionError } from "@/src/components/system/SectionError";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuth } from "@/src/lib/auth/get-auth";

import type { ExploreCourse } from "@/src/app/api/explore-batches/types";
import { getExploreCoursesForUser } from "@/src/lib/services/courses/get-explore-courses-for-user";

export async function ExploreCourses() {
  let courses: ExploreCourse[] | null = null;
  let fetchError = false;

  try {
    const supabase = await createServerSupabaseClient();

    const auth = await getAuth();

    courses = await getExploreCoursesForUser(supabase, auth?.userId);
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <ExploreCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
