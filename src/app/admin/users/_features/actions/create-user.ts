"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { revalidatePath } from "next/cache";
import {
    CreateUserFormValues,
    createUserSchema,
} from "../zod/user-schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createUser(
    rawData: unknown
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    await requireAdminServerOnly();
    try {
        /* -------------------------------------------------- */
        /* 1. Validate input                                  */
        /* -------------------------------------------------- */
        const parsed = createUserSchema.safeParse(rawData);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message || "Invalid input",
            };
        }

        const data: CreateUserFormValues = parsed.data;



        const adminSupabase = await createServiceRoleSupabaseClient();

        /* -------------------------------------------------- */
        /* 3. Normalize email                                 */
        /* -------------------------------------------------- */
        const email = data.email;

        /* -------------------------------------------------- */
        /* 4. Check if user already exists                    */
        /* -------------------------------------------------- */
        const { data: existingUser, error: existingError } =
            await adminSupabase
                .from("users")
                .select("id, status")
                .eq("email", email)
                .maybeSingle();

        if (existingError) {
            return { error: "Failed to check existing user" };
        }

        if (existingUser) {
            if (existingUser.status === "active") {
                return { error: "User with this email already exists" };
            }

            if (existingUser.status === "invited") {
                return { error: "User has already been invited" };
            }

            return { error: "User already exists" };
        }

        /* -------------------------------------------------- */
        /* 5. Construct redirect URL                          */
        /* -------------------------------------------------- */
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
        if (!SITE_URL) {
            return { error: "NEXT_PUBLIC_SITE_URL is not set" };
        }

        const redirectTo = new URL(
            "/auth/callback",
            SITE_URL
        ).toString();

        /* -------------------------------------------------- */
        /* 6. Send invite via Supabase Auth                   */
        /* -------------------------------------------------- */
        const { data: inviteData, error: inviteError } =
            await adminSupabase.auth.admin.inviteUserByEmail(
                email,
                { redirectTo }
            );

        if (inviteError || !inviteData.user) {
            return {
                error:
                    inviteError?.message || "Failed to invite user",
            };
        }

        const userId = inviteData.user.id;

        /* -------------------------------------------------- */
        /* 7. Upsert app-level user record                    */
        /* -------------------------------------------------- */
        const { error: upsertError } = await adminSupabase
            .from("users")
            .upsert(
                {
                    id: userId,
                    email,
                    full_name: data.full_name,
                    phone: data.phone || null,
                    role: data.role,
                    status: "invited",
                },
                { onConflict: "id" }
            );

        if (upsertError) {
            return { error: "Failed to create user record" };
        }

        /* -------------------------------------------------- */
        /* 8. Revalidate                                      */
        /* -------------------------------------------------- */
        revalidatePath("/admin/users");
    } catch (err) {
        console.error("[CREATE_USER_ERROR]", err);
        return { error: "Failed to create user" };
    }
}
