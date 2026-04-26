"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function getBatchEditState(
    batchId: string,
): Promise<{
    locked: boolean;
}> {
    // redirect() throws internally
    await requireAdminServerOnly();

    const supabase =
        await createServerSupabaseClient();

    const now =
        new Date().toISOString();

    const {
        count,
        error,
    } = await supabase
        .from(
            "enrollments",
        )
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq(
            "target_type",
            "batch",
        )
        .eq(
            "batch_id",
            batchId,
        )
        .eq(
            "is_active",
            true,
        )
        .lte(
            "access_starts_at",
            now,
        )
        .or(
            `access_ends_at.is.null,access_ends_at.gte.${now}`,
        );

    if (error) {
        throw new Error(
            error.message,
        );
    }

    return {
        locked:
            (count ?? 0) > 0,
    };
}
