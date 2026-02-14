import type { MyEnrollment } from "../../../../../../api/my-enrollments/types";
import { CourseEnrollmentCard } from "./CourseEnrollmentCard";
import { BatchEnrollmentCard } from "./BatchEnrollmentCard";
import { cookies } from "next/headers";
import { SectionError } from "@/src/components/system/SectionError";

export async function MyEnrollments() {
  let enrollments: MyEnrollment[] | null = null;
  let fetchError = false;

  try {
    const cookieStore = await cookies();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/my-enrollments`,
      {
        method: "GET",
        headers: {
          cookie: cookieStore.toString(),
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      fetchError = true;
    } else {
      enrollments = await res.json();
    }
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <SectionError
        title="Failed to load enrollments"
        message="We couldn’t fetch your enrollments right now."
      />
    );
  }

  if (!enrollments || enrollments.length === 0) {
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
