import { ExploreCourseCard } from "./ExploreCourseCard";
import { cookies } from "next/headers";
import { SectionError } from "@/src/components/system/SectionError";
import { ExploreCourse } from "@/src/app/api/explore-batches/types";

export async function ExploreCourses() {
  let courses: ExploreCourse[] | null = null;
  let fetchError = false;

  try {
    const cookieStore = await cookies();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/explore-courses`,
      {
        method: "GET",
        headers: {
          cookie: cookieStore.toString(),
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      // console.error("Explore courses API failed:", res.status);
      fetchError = true;
    } else {
      courses = await res.json();
    }
  } catch {
    // console.error("Explore courses fetch crashed:", error);
    fetchError = true;
  }

  /**
   * Render phase (outside try/catch)
   */

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
