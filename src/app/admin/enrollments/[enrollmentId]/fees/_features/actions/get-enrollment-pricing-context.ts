import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { EnrollmentResult } from "../types/fee-types";

export async function getEnrollmentPricingContext(
    enrollmentId: string
) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("enrollments")
        .select(`
      id,
      target_type,
      course:course_id (
        id,
        title,
        price
      ),
      batch:batch_id (
        id,
        name,
        course:course_id (
          id,
          title,
          price
        )
      )
    `)
        .eq("id", enrollmentId)
        .single<EnrollmentResult>();

    if (error || !data) {
        throw new Error("Failed to fetch enrollment pricing context");
    }

    const course =
        data.target_type === "course"
            ? data.course
            : data.batch?.course;

    if (!course) {
        throw new Error("Course not found for enrollment");
    }

    return {
        courseId: course.id,
        courseTitle: course.title,
        listPrice: course.price,
    };
}
