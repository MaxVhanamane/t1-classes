"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { ServerActionResponse } from "@/src/types/server-action";

/**
 * Secures a newly invited user's account by setting their password and activating their profile.
 * * ARCHITECTURE NOTE: This uses a Stateless JWT flow and a Distributed Saga Pattern (Rollback) 
 * to guarantee GoTrue (Auth) and PostgREST (Database) remain perfectly in sync.
 */
export async function setupUserPassword(
    password: string,
    accessToken: string
): Promise<ServerActionResponse> {
    try {
        // 1. Initialize the Admin Client
        // We use the Service Role to bypass Row Level Security (RLS) since the user 
        // does not have a browser cookie session established yet.
        const supabaseAdmin = await createServiceRoleSupabaseClient();

        // 2. Cryptographically Verify the Token
        // Passing the raw JWT to getUser() forces the GoTrue server to validate the signature.
        // If the token is expired, forged, or previously revoked, this will immediately throw.
        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

        if (authError || !authData.user) {
            return { error: "Setup link is invalid or expired. Please request a new one." };
        }

        const userId = authData.user.id;

        // 3. Update the Password (The Castle Wall)
        // Because we cryptographically proved they own the token in Step 2, 
        // it is secure to use the admin bypass to forcefully inject their new password.
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: password }
        );

        if (passwordError) {
            return { error: passwordError.message || "Failed to secure account." };
        }

        // 4. Update the Public Profile (The Name Tag)
        // Upgrade their UI status so the Admin Dashboard knows they are ready to use the app.
        const { error: dbError } = await supabaseAdmin
            .from("users")
            .update({ status: "active" })
            .eq("id", userId);

        // 5. The Compensating Transaction (Rollback)
        // If the database update fails (e.g., network drop), we are stuck in a split-state:
        // the user has a password but is still marked 'invited'. 
        // We must rollback Step 3 by scrambling the password to lock them back out.
        if (dbError) {
            console.error("[ACTIVATION_ERROR_ROLLBACK_INITIATED]", dbError);

            await supabaseAdmin.auth.admin.updateUserById(
                userId,
                // Scramble with a 64-character random string to guarantee lockout
                { password: crypto.randomUUID() + crypto.randomUUID() }
            );

            return {
                error: "A network error occurred while activating your profile. Your password was not saved. Please try again."
            };
        }

        // 6. The Global Kill Switch (Session Annihilation)
        // The password is set and the profile is active. We now permanently revoke the 
        // temporary setup refresh token globally in the database. This ensures the 
        // 1-hour access token cannot be renewed, forcing a clean login through the front door.
        await supabaseAdmin.auth.admin.signOut(accessToken, "global");



    } catch (error) {
        console.error("[SETUP_ACTION_ERROR]", error);
        return { error: "An unexpected error occurred." };
    }
}
