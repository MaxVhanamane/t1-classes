"use server";

import { revalidatePath } from "next/cache";
import { batchSchema } from "../zod-schema/schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";


export async function updateBatch(
    batchId: string,
    input: unknown
) {
    /**
     * 1. Validate input
     */
    const parsed = batchSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error("Invalid batch data");
    }

    /**
     * 2. Auth + admin check
     */
    const staff = await getCurrentStaff();
    if (staff.role !== "admin") {
        throw new Error("Only admins can update batches");
    }

    /**
     * 3. Call atomic RPC
     */
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc(
        "update_batch_with_courses",
        {
            p_batch_id: batchId,
            p_name: parsed.data.name,
            p_description: parsed.data.description,
            p_batch_highlights: parsed.data.batch_highlights,
            p_price: parsed.data.price,
            p_mode: parsed.data.mode,
            p_status: parsed.data.status,
            p_is_active: parsed.data.is_active,
            p_admission_open: parsed.data.admission_open,
            p_languages: parsed.data.languages,
            p_center_name: parsed.data.center_name,
            p_start_date: parsed.data.start_date,
            p_end_date: parsed.data.end_date,
            p_duration: parsed.data.duration,
            p_capacity: parsed.data.capacity,
            p_schedule: parsed.data.schedule,
            p_meeting_link: parsed.data.meeting_link,

            p_course_ids: parsed.data.course_ids,
        }
    );

    if (error) {
        throw new Error(error.message);
    }

    /**
     * 4. Revalidate
     */
    revalidatePath("/admin/batches");
}
