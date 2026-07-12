"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { UpdateUserFormValues, updateUserSchema } from "../zod/user-schema";

export async function updateUser(
  userId: string,
  rawData: unknown,
): Promise<ServerActionResponse> {
  /* ---------------------------------------- */
  /* Auth                                     */
  /* ---------------------------------------- */
  await requireAdminServerOnly();

  try {
    /* ---------------------------------------- */
    /* Validate User ID                         */
    /* ---------------------------------------- */
    if (!userId) {
      return { error: "User ID is required" };
    }

    /* ---------------------------------------- */
    /* Validate Input                           */
    /* ---------------------------------------- */
    const parsed = updateUserSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const data: UpdateUserFormValues = parsed.data;

    /* ---------------------------------------- */
    /* Supabase                                 */
    /* ---------------------------------------- */
    const supabase = await createServerSupabaseClient();

    /* ---------------------------------------- */
    /* STATE MACHINE GATEKEEPER                 */
    /* ---------------------------------------- */
    // 1. Fetch the user's current exact state from the database
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("status")
      .eq("id", userId)
      .single();

    if (fetchError || !existingUser) {
      return { error: "User not found in the database." };
    }

    // RULE 1: An 'invited' user is locked. Their status cannot be manually changed.
    // If the admin made a mistake, they must use the "Delete User" action instead.
    if (existingUser.status === "invited" && data.status !== "invited") {
      return {
        error: "Security Check: You cannot manually change the status of a pending invitation. Please delete the user to cancel the invite.",
      };
    }

    // RULE 2: No time travel. An onboarded user cannot be downgraded back to 'invited'.
    if (existingUser.status !== "invited" && data.status === "invited") {
      return {
        error: "Security Check: You cannot downgrade an onboarded user back to 'invited'.",
      };
    }

    /* ---------------------------------------- */
    /* Sanitize                                 */
    /* ---------------------------------------- */
    const sanitizedData = {
      full_name: data.full_name,
      phone: data.phone || null,
      role: data.role,
      status: data.status,
      qualification: data.qualification || null,
      bio: data.bio || null,
      guardian_name: data.guardian_name || null,
      guardian_phone: data.guardian_phone || null,
      guardian_email: data.guardian_email || null,
    };

    /* ---------------------------------------- */
    /* Update                                   */
    /* ---------------------------------------- */
    const { error: updateError } = await supabase
      .from("users")
      .update(sanitizedData)
      .eq("id", userId);

    if (updateError) {
      console.error("[UPDATE_USER_DB_ERROR]:", updateError);
      return { error: "Failed to update user in the database" };
    }


  } catch (error) {
    console.error("[UPDATE_USER_ERROR]", error);
    return { error: "An unexpected error occurred while updating the user" };
  }
}
