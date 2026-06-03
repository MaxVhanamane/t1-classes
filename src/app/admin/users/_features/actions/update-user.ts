"use server";


import {
  createServerSupabaseClient,
} from "@/src/lib/supabase/supabase-server";

import {
  requireAdminServerOnly,
} from "@/src/lib/auth/require-role-server-only";

import {
  ServerActionResponse,
} from "@/src/types/server-action";

import {
  UpdateUserFormValues,
  updateUserSchema,
} from "../zod/user-schema";

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
      return {
        error:
          "User ID is required",
      };
    }

    /* ---------------------------------------- */
    /* Validate Input                           */
    /* ---------------------------------------- */

    const parsed =
      updateUserSchema.safeParse(
        rawData,
      );
    console.log("PPPPPPPPPPPPPPPPPPP update", parsed)

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]
            ?.message ??
          "Invalid input",
      };
    }

    const data: UpdateUserFormValues =
      parsed.data;

    /* ---------------------------------------- */
    /* Supabase                                 */
    /* ---------------------------------------- */

    const supabase =
      await createServerSupabaseClient();

    /* ---------------------------------------- */
    /* Sanitize                                 */
    /* ---------------------------------------- */

    const sanitizedData = {
      full_name:
        data.full_name,

      phone:
        data.phone || null,

      role: data.role,

      status: data.status,

      qualification:
        data.qualification ||
        null,

      bio:
        data.bio || null,

      guardian_name:
        data.guardian_name ||
        null,

      guardian_phone:
        data.guardian_phone ||
        null,

      guardian_email:
        data.guardian_email ||
        null,
    };

    /* ---------------------------------------- */
    /* Update                                   */
    /* ---------------------------------------- */

    const { error } =
      await supabase
        .from("users")
        .update(
          sanitizedData,
        )
        .eq("id", userId);

    if (error) {
      console.error(
        "Error updating user:",
        error,
      );

      return {
        error:
          "Failed to update user",
      };
    }



  } catch (error) {
    console.error(
      "[UPDATE_USER_ERROR]",
      error,
    );

    return {
      error:
        "Failed to update user",
    };
  }
}
