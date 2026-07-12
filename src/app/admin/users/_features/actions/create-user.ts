"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { CreateUserFormValues, createUserSchema } from "../zod/user-schema";

export async function createUser(
    rawData: unknown,
): Promise<ServerActionResponse> {
    await requireAdminServerOnly();

    try {
        const parsed = createUserSchema.safeParse(rawData);

        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
        }

        const data: CreateUserFormValues = parsed.data;
        const supabase = await createServiceRoleSupabaseClient();
        const email = data.email.trim().toLowerCase();

        /* ---------------------------------------- */
        /* Existing User Check                      */
        /* ---------------------------------------- */
        const { data: existingUser, error: existingError } = await supabase
            .from("users")
            .select("id, status")
            .eq("email", email)
            .maybeSingle();

        if (existingError) return { error: "Failed to check existing user" };
        if (existingUser) {
            if (existingUser.status === "active") return { error: "User with this email already exists" };
            if (existingUser.status === "invited") return { error: "User has already been invited" };
            return { error: "User already exists" };
        }

        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
        if (!SITE_URL) return { error: "NEXT_PUBLIC_SITE_URL is not set" };

        const redirectTo = new URL("/auth/callback", SITE_URL).toString();

        /* ---------------------------------------- */
        /* Step 1: Invite User via Auth API         */
        /* ---------------------------------------- */
        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
            email,
            { redirectTo },
        );

        if (inviteError || !inviteData.user) {
            console.error("[SUPABASE_INVITE_ERROR]", inviteError);
            return { error: inviteError?.message ?? "Failed to invite user" };
        }

        const userId = inviteData.user.id;

        /* ---------------------------------------- */
        /* Step 2: Update the Public Record         */
        /* (Your DB trigger already created the row)*/
        /* ---------------------------------------- */
        const { error: updateError } = await supabase
            .from("users")
            .update({
                full_name: data.full_name,
                phone: data.phone || null,
                role: data.role,
                status: "invited",
                qualification: data.qualification || null,
                bio: data.bio || null,
                guardian_name: data.guardian_name || null,
                guardian_phone: data.guardian_phone || null,
                guardian_email: data.guardian_email || null,
            })
            .eq("id", userId); // Match the ID created by the trigger

        /* ---------------------------------------- */
        /* Step 3: The Rollback                     */
        /* ---------------------------------------- */
        if (updateError) {
            console.error("[CRITICAL_PUBLIC_RECORD_UPDATE_FAILED]", updateError);

            // ROLLBACK: Destroy the auth record to prevent a broken partial state
            await supabase.auth.admin.deleteUser(userId);

            return {
                error: "Database error during profile generation. The invitation was aborted. Please try again.",
            };
        }



    } catch (error) {
        console.error("[CREATE_USER_ERROR]", error);
        return { error: "Failed to create user" };
    }
}
