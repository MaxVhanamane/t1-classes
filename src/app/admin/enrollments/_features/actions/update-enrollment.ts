"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { CreateEnrollmentInput } from "../types/enrollments";
import { createEnrollmentSchema } from "../zod-schema/enrollments";
import { revalidatePath } from "next/cache";

export async function updateEnrollment(
    enrollmentId: string,
    input: CreateEnrollmentInput
) {
    const parsed = createEnrollmentSchema.parse(input);

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("enrollments")
        .update({
            user_id: parsed.user_id,

            target_type: parsed.target_type,
            batch_id: parsed.batch_id ?? null,
            course_id: parsed.course_id ?? null,

            enrollment_type: parsed.enrollment_type,
            registration_channel: parsed.registration_channel,
            status: parsed.status,
            is_active: parsed.is_active ?? true,

            access_starts_at: parsed.access_starts_at,
            access_ends_at: parsed.access_ends_at ?? null,

            notes: parsed.notes ?? null,
        })
        .eq("id", enrollmentId);
    revalidatePath("/admin/enrollments");


    if (error) {
        throw new Error(error.message);
    }
}
