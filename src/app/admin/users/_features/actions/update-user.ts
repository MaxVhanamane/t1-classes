"use server";

import { revalidatePath } from "next/cache";
import { updateUserSchema } from "../zod/user-schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function updateUser(
  userId: string,
  data: unknown
): Promise<ServerActionResponse> {
  // redirect() throws internally; calling inside try/catch would prevent the redirect
  await requireAdminServerOnly();
  try {
    /* -------------------------------------------------- */
    /* 1. Ensure a valid user ID is provided              */
    /* -------------------------------------------------- */
    if (!userId) {
      return { error: "User ID is required" };
    }



    /* -------------------------------------------------- */
    /* 3. Validate data using Zod                         */
    /* -------------------------------------------------- */
    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message || "Invalid input",
      };
    }

    const validatedData = parsed.data;

    /* -------------------------------------------------- */
    /* 4. Create Supabase client after authorization      */
    /* -------------------------------------------------- */
    const supabase = await createServerSupabaseClient();

    /* -------------------------------------------------- */
    /* 5. Sanitize phone value                            */
    /* -------------------------------------------------- */
    const sanitizedData = {
      ...validatedData,
      ...(validatedData.phone !== undefined && {
        phone:
          validatedData.phone === ""
            ? null
            : validatedData.phone,
      }),
    };

    /* -------------------------------------------------- */
    /* 6. Update user                                     */
    /* -------------------------------------------------- */
    const { error } = await supabase
      .from("users")
      .update(sanitizedData)
      .eq("id", userId);

    if (error) {
      console.error("Error updating user:", error);
      return { error: "Failed to update user" };
    }

    /* -------------------------------------------------- */
    /* 7. Revalidate                                      */
    /* -------------------------------------------------- */
    revalidatePath("/admin/users");
  } catch (err) {
    console.error("[UPDATE_USER_ERROR]", err);
    return { error: "Failed to update user" };
  }
}
