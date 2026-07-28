import type { MyEnrollment } from "../../../../../../../lib/services/enrollments/types";
import { CourseEnrollmentCard } from "./CourseEnrollmentCard";
import { BatchEnrollmentCard } from "./BatchEnrollmentCard";
import { SectionError } from "@/src/components/system/SectionError";
import { redirect } from "next/navigation";
import { getAuthClaims } from "@/src/lib/auth/claims/get-auth-claims";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getMyEnrollmentsService } from "@/src/lib/services/enrollments/get-my-enrollments";
import { BatchPerformanceHub } from "../../performance/batch-performance-hub";

export async function MyEnrollments() {
  let enrollments: MyEnrollment[] | null = null;
  let fetchError = false;

  try {
    const auth = await getAuthClaims();

    if (!auth?.userId) {
      redirect("/login");
    }

    const supabase = await createServerSupabaseClient();
    enrollments = await getMyEnrollmentsService(supabase, auth.userId);
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

  // Separate the enrollments so we can pass just the batches to the performance hub
  const batchEnrollments = enrollments.filter(
    (enrollment) => enrollment.targetType === "batch",
  );

  return (
    <div className="space-y-12">
      {/* SECTION 1: Standard Enrollments (Continue Learning) */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <BatchPerformanceHub batchEnrollments={batchEnrollments} />
    </div>
  );
}
