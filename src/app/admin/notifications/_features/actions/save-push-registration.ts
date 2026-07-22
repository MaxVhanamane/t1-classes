"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { pushRegistrationSchema } from "../zod/push-registration.schema";
import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";

export async function savePushRegistration(
    input: unknown
): Promise<ServerActionResponse<void>> {
    // redirect() throws internally; keep outside try/catch block
    const student = await requireStudentServerOnly();

    try {
        /* ---------- 1. Validate Input ---------- */

        const parsed = pushRegistrationSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid push registration.",
            };
        }

        const values = parsed.data;

        /* ---------- 2. Admin Cleanup (Bypass RLS) ---------- */

        /**
         * WHY SERVICE ROLE / ADMIN CLIENT IS USED HERE:
         * 
         * A browser's Firebase Installation ID (FID) must only belong to one active user.
         * If User 1 logs out and User 2 logs into the exact same browser/device:
         * 
         * 1. The browser sends User 1's existing FID under User 2's session.
         * 2. If we attempt to delete User 1's registration using the standard client,
         *    Supabase's Row Level Security (RLS) blocks it because User 2 does not own User 1's row.
         * 3. The delete silently affects 0 rows, leading to a duplicate key constraint error (23505)
         *    when the upsert below tries to write the same FID.
         * 
         * Using the Admin/Service-Role client bypasses RLS restrictions solely to strip this
         * physical device FID from any previous account before assigning it to the current student.
         */
        const supabaseAdmin = await createServiceRoleSupabaseClient();

        const { error: deleteError } = await supabaseAdmin
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

        /* ---------- 3. Upsert Active User Registration ---------- */

        /**
         * Now that the FID is guaranteed to be unlinked from other accounts,
         * use the standard user-scoped client to register or update the current student's record.
         * 'onConflict: user_id' ensures that if this student logged in on a new device, 
         * their previous device registration is overwritten to enforce '1 User = 1 Active Device'.
         */
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("push_registrations")
            .upsert(
                {
                    user_id: student.userId,
                    fid: values.fid,
                    user_agent: values.userAgent,
                    platform: values.platform,
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
