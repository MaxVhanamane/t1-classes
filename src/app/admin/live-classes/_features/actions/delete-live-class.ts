"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

export async function deleteLiveClass(
    id: string,
): Promise<ServerActionResponse> {
    await requireStaffServerOnly();

    try {
        if (!id.trim()) {
            return {
                error: "Live class ID is required",
            };
        }

        const supabase =
            await createServerSupabaseClient();

        const { error } =
            await supabase
                .from("live_classes")
                .delete()
                .eq("id", id);

        if (error) {
            console.error(
                "[DELETE_LIVE_CLASS_ERROR]",
                error,
            );

            return {
                error:
                    error.message ||
                    "Failed to delete live class.",
            };
        }
    } catch (error) {
        console.error(
            "[DELETE_LIVE_CLASS_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
