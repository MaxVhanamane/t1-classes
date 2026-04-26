"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
  EnrollmentResult,
  EnrollmentPricingContext,
} from "../types/fee-types";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function getEnrollmentPricingContext(
  enrollmentId: string
): Promise<EnrollmentPricingContext> {
  await requireAdminServerOnly();

  const supabase =
    await createServerSupabaseClient();

  const { data, error } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        target_type,
        course:course_id (
          id,
          title,
          list_price,
          sale_price
        ),
        batch:batch_id (
          id,
          title,
          list_price,
          sale_price
        )
      `)
      .eq("id", enrollmentId)
      .single<EnrollmentResult>();

  if (error || !data) {
    throw new Error(
      "Failed to fetch enrollment pricing context"
    );
  }

  /**
   * COURSE ENROLLMENT
   */
  if (
    data.target_type ===
    "course"
  ) {
    if (!data.course) {
      throw new Error(
        "Course not found for enrollment"
      );
    }

    return {
      targetType: "course",
      title: data.course.title,
      listPrice: Number(
        data.course.list_price
      ),
      salePrice: Number(
        data.course.sale_price
      ),
    };
  }

  /**
   * BATCH ENROLLMENT
   */
  if (!data.batch) {
    throw new Error(
      "Batch not found for enrollment"
    );
  }

  return {
    targetType: "batch",
    title: data.batch.title,
    listPrice: Number(
      data.batch.list_price
    ),
    salePrice: Number(
      data.batch.sale_price
    ),
  };
}
