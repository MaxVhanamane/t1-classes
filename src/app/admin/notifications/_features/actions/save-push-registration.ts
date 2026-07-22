"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import { pushRegistrationSchema } from "../zod/push-registration.schema";

export async function savePushRegistration(
    input: unknown
): Promise<ServerActionResponse<void>> {
    // redirect() throws internally; keep outside try/catch
    const student = await requireStudentServerOnly();

    try {
        /* ---------- validate ---------- */

        const parsed = pushRegistrationSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid push registration.",
            };
        }

        const values = parsed.data;

        const supabase = await createServerSupabaseClient();

        /**
         * A browser (FID) can only belong to one user at a time.
         *
         * If the same browser is later used to sign in as a different student,
         * the unique(fid) constraint would conflict with our upsert(user_id).
         *
         * Remove any existing registration for this FID that belongs to another
         * user before upserting the current user's active registration.
         */
        const { error: deleteError } = await supabase
            .from("push_registrations")
            .delete()
            .eq("fid", values.fid)
            .neq("user_id", student.userId);

        if (deleteError) {
            console.error(
                "[DELETE_PUSH_REGISTRATION_ERROR]",
                deleteError
            );

            return {
                error:
                    "Failed to register this device for push notifications.",
            };
        }

        /* ---------- upsert active registration ---------- */

        const { error } = await supabase
            .from("push_registrations")
            .upsert(
                {
                    user_id: student.userId,
                    fid: values.fid,
                    user_agent: values.userAgent,
                    platform: values.platform
                },
                {
                    onConflict: "user_id",
                }
            );

        if (error) {
            console.error(
                "[SAVE_PUSH_REGISTRATION_ERROR]",
                error
            );

            return {
                error:
                    "Failed to register this device for push notifications.",
            };
        }

        return {
            data: undefined,
        };
    } catch (error) {
        console.error(
            "[SAVE_PUSH_REGISTRATION_FATAL]",
            error
        );

        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
