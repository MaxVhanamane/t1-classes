"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";

export async function updateBatchThumbnail(
    batchId: string,
    newKey: string
) {
    const staff = await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    /* ---------- fetch batch ---------- */
    const { data } = await supabase
        .from("batches")
        .select("created_by, thumbnail_image")
        .eq("id", batchId)
        .single();

    if (!data) {
        throw new Error("Batch not found");
    }

    /* ---------- auth check ---------- */
    // If you only allow admins, this is enough:
    if (staff.role !== "admin") {
        throw new Error("Unauthorized");
    }

    // If you later allow non-admin creators, use this instead:
    /*
    if (
      staff.role !== "admin" &&
      data.created_by !== staff.id
    ) {
      throw new Error("Unauthorized");
    }
    */

    /* ---------- delete old thumbnail ---------- */
    if (data.thumbnail_image && data.thumbnail_image !== newKey) {
        await deleteR2Object(
            process.env.R2_PUBLIC_BUCKET_NAME!,
            data.thumbnail_image
        ).catch(console.error);
    }

    /* ---------- update batch ---------- */
    const { error } = await supabase
        .from("batches")
        .update({
            thumbnail_image: newKey,
            updated_by: staff.id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);

    if (error) {
        throw new Error(error.message);
    }
}
