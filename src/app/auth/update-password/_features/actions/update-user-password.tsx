"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { ServerActionResponse } from "@/src/types/server-action";

/**
 * Resets an active user's password securely using their recovery access token.
 */
export async function updateUserPassword(
  password: string,
  accessToken: string,
): Promise<ServerActionResponse> {
  try {
    // 1. Initialize the Admin Client to bypass normal session checks
    const supabaseAdmin = await createServiceRoleSupabaseClient();

    // 2. Cryptographically verify that the token belongs to a real user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return {
        error:
          "The reset link is invalid or expired. Please request a new one from administration.",
      };
    }

    const userId = authData.user.id;

    // 3. Update the password
    const { error: passwordError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
      });

    if (passwordError) {
      return { error: passwordError.message || "Failed to update password." };
    }

    // 4. Global Kill Switch: Revoke the temporary recovery session instantly
    await supabaseAdmin.auth.admin.signOut(accessToken, "global");
  } catch (error) {
    console.error("[PASSWORD_RESET_ACTION_ERROR]", error);
    return {
      error: "An unexpected error occurred while updating your password.",
    };
  }
}
