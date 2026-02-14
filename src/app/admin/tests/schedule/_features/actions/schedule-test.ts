"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { scheduleTestSchema } from "../zod/schedule-test.schema";

export async function scheduleTest(
    raw: unknown
) {
    const staff = await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    const parsed = scheduleTestSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error("INVALID_SCHEDULE_DATA");
    }

    const data = parsed.data;

    const { error } = await supabase
        .from("test_distributions")
        .insert({
            test_id: data.test_id,
            audience: data.audience,
            batch_id: data.batch_id,
            course_id: data.course_id,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
            duration_minutes: data.duration_minutes,
            max_attempts: data.max_attempts,
            created_by: staff.id,
        });

    if (error) {
        console.error("[SCHEDULE_TEST_ERROR]", error);
        throw new Error("FAILED_TO_SCHEDULE_TEST");
    }

    return { success: true };
}
