import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
  EnrollmentResult,
  EnrollmentPricingContext,
} from "../types/fee-types";

export async function getEnrollmentPricingContext(
  enrollmentId: string
): Promise<EnrollmentPricingContext> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
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
          batch_courses (
            course:courses (
              id,
              title,
              price
            )
          )
        )
      `
    )
    .eq("id", enrollmentId)
    .single<EnrollmentResult>();

  if (error || !data) {
    throw new Error("Failed to fetch enrollment pricing context");
  }

  /**
   * COURSE ENROLLMENT
   */
  if (data.target_type === "course") {
    if (!data.course) {
      throw new Error("Course not found for enrollment");
    }

    return {
      targetType: "course",
      title: data.course.title,
      listPrice: data.course.price,
    };
  }

  /**
   * BATCH ENROLLMENT
   */
  if (!data.batch) {
    throw new Error("Batch not found for enrollment");
  }

  const batchCourses = data.batch.batch_courses;

  if (!batchCourses || batchCourses.length === 0) {
    throw new Error("No courses found for batch");
  }

  const courses = batchCourses
    .map((bc) => bc.course)
    .filter(
      (course): course is { id: string; title: string; price: number } =>
        course !== null
    );

  if (courses.length === 0) {
    throw new Error("No valid courses found for batch");
  }

  const listPrice = courses.reduce(
    (sum, course) => sum + course.price,
    0
  );

  return {
    targetType: "batch",
    title: data.batch.name,
    listPrice,
  };
}
