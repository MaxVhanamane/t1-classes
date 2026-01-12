"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { CreateEnrollmentInput } from "../types/enrollments";
import { createEnrollmentSchema } from "../zod-schema/enrollments";
import { revalidatePath } from "next/cache";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { PostgrestError } from "@supabase/supabase-js";

export async function createEnrollment(input: CreateEnrollmentInput) {
    /**
     * 1. Validate input
     */
    const parsed = createEnrollmentSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error("Invalid enrollment data");
    }

    const data = parsed.data;

    /**
     * 2. Auth / role check
     */
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

    if (!staff || staff.role !== "admin") {
        throw new Error("Only admins can create enrollments");
    }

    /**
     * 3. Normalize target fields (CRITICAL)
     */
    const batchId =
        data.target_type === "batch" ? data.batch_id ?? null : null;

    const courseId =
        data.target_type === "course" ? data.course_id ?? null : null;

    /**
     * 4. Sanity guard
     */
    if (data.target_type === "batch" && !batchId) {
        throw new Error("Batch is required for batch enrollment");
    }

    if (data.target_type === "course" && !courseId) {
        throw new Error("Course is required for course enrollment");
    }

    /**
     * 5. Pre-check (clean UX)
     */
    const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", data.user_id)
        .eq("target_type", data.target_type)
        .eq("batch_id", batchId)
        .eq("course_id", courseId)
        .maybeSingle();

    if (existing) {
        throw new Error(
            data.target_type === "batch"
                ? "User is already enrolled in this batch"
                : "User is already enrolled in this course"
        );
    }

    /**
     * 6. Insert
     */
    const { error } = await supabase.from("enrollments").insert({
        user_id: data.user_id,
        target_type: data.target_type,
        batch_id: batchId,
        course_id: courseId,
        enrollment_type: data.enrollment_type,
        registration_channel: data.registration_channel,
        status: data.status,
        is_active: data.is_active ?? true,
        access_starts_at: data.access_starts_at,
        access_ends_at: data.access_ends_at ?? null,
        notes: data.notes ?? null,
        created_by: staff.id,
    });

    /**
     * 7. DB-level safety (race condition safe)
     */
    if (error) {
        const pgError: PostgrestError = error;

        if (pgError.code === "23505") {
            throw new Error(
                data.target_type === "batch"
                    ? "User is already enrolled in this batch"
                    : "User is already enrolled in this course"
            );
        }

        throw new Error(pgError.message);
    }

    /**
     * 8. Revalidate
     */
    revalidatePath("/admin/enrollments");
}
