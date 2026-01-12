import { getMyEnrollments } from "../actions/getMyEnrollments";
import type { MyEnrollment } from "../types";
import { CourseEnrollmentCard } from "./CourseEnrollmentCard";
import { BatchEnrollmentCard } from "./BatchEnrollmentCard";

export async function MyEnrollments() {
  const enrollments: MyEnrollment[] = await getMyEnrollments();

  if (enrollments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          You haven’t enrolled in any courses yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Explore courses below to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
      {enrollments.map((enrollment) => {
        if (enrollment.targetType === "course") {
          return (
            <CourseEnrollmentCard
              key={enrollment.enrollmentId}
              enrollment={enrollment}
            />
          );
        }

        return (
          <BatchEnrollmentCard
            key={enrollment.enrollmentId}
            enrollment={enrollment}
          />
        );
      })}
    </div>
  );
}
