"use server";

import { revalidatePath } from "next/cache";
import { batchSchema } from "../zod-schema/schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";


export async function createBatch(input: unknown) {
    /**
     * 1. Validate input shape
     * (UX + developer safety)
     */
    const parsed = batchSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error("Invalid batch data");
    }

    /**
     * 2. Auth + staff check (centralized)
     */
    const staff = await getCurrentStaff();

    /**
     * 3. Admin-only guard (business rule)
     */
    if (staff.role !== "admin") {
        throw new Error("Only admins can create batches");
    }

    /**
     * 4. Call atomic DB transaction (RPC)
     */
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc(
        "create_batch_with_courses",
        {
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
     * 5. Revalidate
     */
    revalidatePath("/admin/batches");
}
