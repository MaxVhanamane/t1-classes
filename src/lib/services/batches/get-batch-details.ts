"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import type { BatchDetailsResponse } from "@/src/types/batches.types";

export async function getBatchDetails(
    batchId: string,
): Promise<BatchDetailsResponse> {
    const supabase =
        await createServerSupabaseClient();

    const { data, error } = await supabase.rpc(
        "get_batch_details",
        {
            p_batch_id: batchId,
        }
    );

    if (error) {
        if (
            error.message.includes(
                "BATCH_ACCESS_DENIED"
            )
        ) {
            throw new Error(
                "BATCH_ACCESS_DENIED"
            );
        }

        if (
            error.message.includes(
                "BATCH_NOT_FOUND"
            )
        ) {
            throw new Error(
                "BATCH_NOT_FOUND"
            );
        }

        throw error;
    }

    return data as BatchDetailsResponse;
}
