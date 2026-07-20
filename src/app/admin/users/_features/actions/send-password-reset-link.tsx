"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

export async function sendPasswordResetLink(
  email: string,
): Promise<ServerActionResponse> {
  // 1. Ensure only admins can trigger this
  await requireAdminServerOnly();

  try {
    // 2. Use the Service Role to bypass PKCE cookie requirements
    const supabaseAdmin = await createServiceRoleSupabaseClient();

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
    if (!SITE_URL) {
      return { error: "NEXT_PUBLIC_SITE_URL is not set" };
    }

    const redirectTo = new URL("/auth/update-password", SITE_URL).toString();

    // 3. Trigger the recovery email statelessly
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("[SEND_RESET_LINK_ERROR]", error);
      return { error: error.message || "Failed to send reset link." };
    }
  } catch (error) {
    console.error("[SEND_RESET_LINK_UNEXPECTED]", error);
    return { error: "An unexpected error occurred while sending the link." };
  }
}
