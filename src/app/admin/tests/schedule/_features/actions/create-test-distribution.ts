"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { ScheduleTestInput } from "../zod/schedule-test.schema";

export async function createTestDistribution(
    input: ScheduleTestInput
) {
    const staff = await getCurrentStaff();
    const supabase = await createServerSupabaseClient();


    const { error } = await supabase
        .from("test_distributions")
        .insert({
            test_id: input.test_id,
            audience: input.audience,

            batch_id: input.batch_id,
            course_id: input.course_id,

            starts_at: input.starts_at,
            ends_at: input.ends_at,

            duration_minutes: input.duration_minutes,
            max_attempts: input.max_attempts,

            created_by: staff.id,
        });

    if (error) {

        throw new Error("FAILED_TO_CREATE_DISTRIBUTION");
    }

    return { success: true };
}
