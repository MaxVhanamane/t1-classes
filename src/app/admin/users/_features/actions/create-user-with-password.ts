"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { revalidatePath } from "next/cache";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

type CreateUserWithPasswordInput = {
    email: string;
    password: string;
    full_name?: string;
    phone?: string | null;
    role?: "student" | "teacher" | "parent" | "admin";
};

export async function createUserWithPassword(
    rawData: CreateUserWithPasswordInput
): Promise<ServerActionResponse> {
    await requireAdminServerOnly();

    try {
        const adminSupabase = await createServiceRoleSupabaseClient();

        const email = rawData.email;
        const password = rawData.password;

        /* 1. Check if user already exists */
        const { data: existingUser, error: existingError } =
            await adminSupabase
                .from("users")
                .select("id")
                .eq("email", email)
                .maybeSingle();

        if (existingError) {
            return { error: "Failed to check existing user" };
        }

        if (existingUser) {
            return { error: "User with this email already exists" };
        }

        /* 2. Create user in Supabase Auth */
        const { data: userData, error: createError } =
            await adminSupabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

        if (createError || !userData.user) {
            return {
                error: createError?.message || "Failed to create auth user",
            };
        }

        const userId = userData.user.id;

        /* 3. Insert into public.users */
        const { error: insertError } = await adminSupabase
            .from("users")
            .insert({
                id: userId,
                email,
                full_name: rawData.full_name || "New User",
                phone: rawData.phone || null,
                role: rawData.role || "student",
                status: "active",
            });

        if (insertError) {
            return { error: "Failed to create user profile" };
        }

        /* 4. Revalidate */
        revalidatePath("/admin/users");

        return
    } catch (err) {
        console.error("[CREATE_USER_WITH_PASSWORD_ERROR]", err);
        return { error: "Failed to create user" };
    }
}
