"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { ServerActionResponse } from "@/src/types/server-action";
import { revalidatePath, updateTag } from "next/cache";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function updateBatchThumbnail(
    batchId: string,
    newKey: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireAdminServerOnly();
    try {


        const supabase = await createServerSupabaseClient();

        /* ---------- fetch batch ---------- */
        const { data, error: fetchError } = await supabase
            .from("batches")
            .select("created_by, thumbnail_image, slug, category")
            .eq("id", batchId)
            .single();

        if (fetchError || !data) {
            return { error: "Batch not found" };
        }

        /* ---------- auth check ---------- */
        if (staff.role !== "admin") {
            return { error: "Unauthorized" };
        }

        /* ---------- delete old thumbnail ---------- */
        if (
            data.thumbnail_image &&
            data.thumbnail_image !== newKey
        ) {
            await deleteR2Object(
                process.env.R2_PUBLIC_BUCKET_NAME!,
                data.thumbnail_image
            ).catch((err) => {
                console.error(
                    "[DELETE_OLD_BATCH_THUMBNAIL_FAILED]",
                    err
                );
            });
        }

        /* ---------- update batch ---------- */
        const { error: updateError } = await supabase
            .from("batches")
            .update({
                thumbnail_image: newKey,
                updated_by: staff.userId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", batchId);

        if (updateError) {
            console.error(
                "[UPDATE_BATCH_THUMBNAIL_ERROR]",
                updateError
            );
            return {
                error:
                    "Failed to update batch thumbnail. Please try again.",
            };
        }

        /* ---------- revalidate ---------- */
        revalidatePath("/admin/batches");
        updateTag(`batch-detail-${data.slug}`);
        updateTag(`batch-list-${data.category}`);
    } catch (error) {
        console.error("[UPDATE_BATCH_THUMBNAIL_FATAL]", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
