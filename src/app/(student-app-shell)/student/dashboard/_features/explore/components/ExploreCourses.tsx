import { getExploreCourses } from "../actions/getExploreCourses";
import { ExploreCourseCard } from "./ExploreCourseCard";

export async function ExploreCourses() {
  const courses = await getExploreCourses();

  if (courses.length === 0) {
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
