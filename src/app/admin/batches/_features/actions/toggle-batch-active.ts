"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";

export async function toggleBatchActive(
    batchId: string,
    isActive: boolean
) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("batches")
        .update({
            is_active: isActive,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);

    if (error) {
        throw error;
    }

    revalidatePath("/admin/batches");
}
