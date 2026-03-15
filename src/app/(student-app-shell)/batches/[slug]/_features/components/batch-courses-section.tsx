import { ExploreCourseCard } from "@/src/app/(student-app-shell)/student/dashboard/_features/explore/components/ExploreCourseCard";
import { ExploreCourseForBatch } from "@/src/app/api/explore-batches/[slug]/types";

export function BatchCoursesSection({
  courses,
}: {
  courses: ExploreCourseForBatch[];
}) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="relative">
      <div className="mx-auto  space-y-16">
        {/* Header Block */}
        <div className="max-w-3xl space-y-6">
          {/* Eyebrow */}
          <div className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            Academic Structure
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
            Included Full-Length Courses
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed">
            Structured access to comprehensive academic courses forming the core
            foundation of your preparation journey.
          </p>

          <div className="text-sm text-foreground/80">
            {courses.length} Complete Courses Included
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 -mt-4">
          {courses.map((course) => (
            <ExploreCourseCard
              key={course.id}
              course={course}
              context="batch"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
