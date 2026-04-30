"use server";

import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { CreateEnrollmentInput } from "../types/enrollments";
import { createEnrollmentSchema } from "../zod-schema/enrollments";

export async function createEnrollment(input: CreateEnrollmentInput): Promise<ServerActionResponse> {
    const staff = await requireAdminServerOnly();

    try {
        const parsed = createEnrollmentSchema.safeParse(input);
        if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid enrollment data" };

        const data = parsed.data;
        const supabase = await createServerSupabaseClient();

        const batchId = data.target_type === "batch" ? data.batch_id ?? null : null;
        const courseId = data.target_type === "course" ? data.course_id ?? null : null;

        /* ----------  PRECHECK ---------- */
        let query = supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", data.user_id)
            .eq("target_type", data.target_type);

        query = batchId === null ? query.is("batch_id", null) : query.eq("batch_id", batchId);
        query = courseId === null ? query.is("course_id", null) : query.eq("course_id", courseId);

        const { data: existing, error: existingError } = await query.maybeSingle();

        if (existingError) {
            console.error("[CREATE_ENROLLMENT_PRECHECK]", existingError);
            return { error: "Failed to validate enrollment." };
        }

        if (existing) {
            return {
                error:
                    data.target_type === "batch"
                        ? "User is already enrolled in this batch."
                        : "User is already enrolled in this course.",
            };
        }

        /* ---------- INSERT ---------- */
        const { error } = await supabase.from("enrollments").insert({
            user_id: data.user_id,
            target_type: data.target_type,
            batch_id: batchId,
            course_id: courseId,
            enrollment_type: data.enrollment_type,
            registration_channel: data.registration_channel,
            is_active: data.is_active,
            deactivation_reason: data.is_active ? null : data.deactivation_reason ?? null,
            access_starts_at: data.access_starts_at,
            access_ends_at: data.access_ends_at ?? null,
            notes: data.notes ?? null,
            created_by: staff.userId,
        });

        if (error) {
            const pgError = error as PostgrestError;
            if (pgError.code === "23505") {
                return {
                    error:
                        data.target_type === "batch"
                            ? "User is already enrolled in this batch."
                            : "User is already enrolled in this course.",
                };
            }
            console.error("[CREATE_ENROLLMENT_DB]", pgError);
            return { error: "Failed to create enrollment." };
        }

        revalidatePath("/admin/enrollments");


    } catch (error) {
        console.error("[CREATE_ENROLLMENT_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
