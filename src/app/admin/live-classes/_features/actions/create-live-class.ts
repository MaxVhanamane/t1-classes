"use server";


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import {
    createLiveClassSchema,
} from "../zod/create-live-class.schema";

export async function createLiveClass(
    input: unknown,
): Promise<
    ServerActionResponse<string>
> {
    /* redirect() throws internally */
    await requireStaffServerOnly();

    try {
        /* -------------------------- */
        /* Validate                  */
        /* -------------------------- */
        const parsed =
            createLiveClassSchema.safeParse(
                input,
            );

        if (
            !parsed.success
        ) {
            return {
                error:
                    parsed.error
                        .issues[0]
                        ?.message ??
                    "Invalid live class data",
            };
        }

        const values =
            parsed.data;

        const supabase =
            await createServerSupabaseClient();

        /* -------------------------- */
        /* RPC Create                */
        /* -------------------------- */
        const {
            data,
            error,
        } =
            await supabase.rpc(
                "create_live_class",
                {
                    p_title:
                        values.title,

                    p_description:
                        values.description ??
                        null,

                    p_youtube_live_id:
                        values.youtube_live_id,

                    p_starts_at:
                        values.starts_at,

                    p_ends_at:
                        values.ends_at,

                    p_batch_ids:
                        values.batch_ids,
                },
            );

        if (
            error ||
            !data
        ) {
            console.error(
                "[CREATE_LIVE_CLASS_RPC_ERROR]",
                error,
            );

            return {
                error:
                    error
                        ?.message ||
                    "Failed to create live class.",
            };
        }



    } catch (
    error
    ) {
        console.error(
            "[CREATE_LIVE_CLASS_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
