"use server";


import {
    createServiceRoleSupabaseClient,
} from "@/src/lib/supabase/supabase-service-role";

import {
    requireAdminServerOnly,
} from "@/src/lib/auth/require-role-server-only";

import {
    ServerActionResponse,
} from "@/src/types/server-action";

import {
    CreateUserFormValues,
    createUserSchema,
} from "../zod/user-schema";

export async function createUser(
    rawData: unknown,
): Promise<ServerActionResponse> {
    /* ---------------------------------------- */
    /* Auth                                     */
    /* ---------------------------------------- */

    await requireAdminServerOnly();

    try {
        /* ---------------------------------------- */
        /* Validate                                 */
        /* ---------------------------------------- */

        const parsed =
            createUserSchema.safeParse(
                rawData,
            );

        console.log("PPPPPPPPPPPPPPPPPPP", parsed)

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]
                        ?.message ??
                    "Invalid input",
            };
        }

        const data: CreateUserFormValues =
            parsed.data;

        /* ---------------------------------------- */
        /* Supabase                                 */
        /* ---------------------------------------- */

        const supabase =
            await createServiceRoleSupabaseClient();

        /* ---------------------------------------- */
        /* Normalize                                */
        /* ---------------------------------------- */

        const email =
            data.email
                .trim()
                .toLowerCase();

        /* ---------------------------------------- */
        /* Existing User Check                      */
        /* ---------------------------------------- */

        const {
            data: existingUser,
            error: existingError,
        } = await supabase
            .from("users")
            .select(
                "id, status",
            )
            .eq("email", email)
            .maybeSingle();

        if (existingError) {
            return {
                error:
                    "Failed to check existing user",
            };
        }

        if (existingUser) {
            if (
                existingUser.status ===
                "active"
            ) {
                return {
                    error:
                        "User with this email already exists",
                };
            }

            if (
                existingUser.status ===
                "invited"
            ) {
                return {
                    error:
                        "User has already been invited",
                };
            }

            return {
                error:
                    "User already exists",
            };
        }

        /* ---------------------------------------- */
        /* Site URL                                 */
        /* ---------------------------------------- */

        const SITE_URL =
            process.env
                .NEXT_PUBLIC_SITE_URL;

        if (!SITE_URL) {
            return {
                error:
                    "NEXT_PUBLIC_SITE_URL is not set",
            };
        }

        const redirectTo =
            new URL(
                "/auth/callback",
                SITE_URL,
            ).toString();

        /* ---------------------------------------- */
        /* Invite User                              */
        /* ---------------------------------------- */

        const {
            data: inviteData,
            error: inviteError,
        } =
            await supabase.auth.admin.inviteUserByEmail(
                email,
                {
                    redirectTo,
                },
            );

        if (
            inviteError ||
            !inviteData.user
        ) {
            return {
                error:
                    inviteError?.message ??
                    "Failed to invite user",
            };
        }

        const userId =
            inviteData.user.id;

        /* ---------------------------------------- */
        /* Create User Record                       */
        /* ---------------------------------------- */

        const {
            error: upsertError,
        } = await supabase
            .from("users")
            .upsert(
                {
                    id: userId,

                    email,

                    full_name:
                        data.full_name,

                    phone:
                        data.phone ||
                        null,

                    role: data.role,

                    status: "invited",

                    qualification:
                        data.qualification ||
                        null,

                    bio:
                        data.bio ||
                        null,

                    guardian_name:
                        data.guardian_name ||
                        null,

                    guardian_phone:
                        data.guardian_phone ||
                        null,

                    guardian_email:
                        data.guardian_email ||
                        null,
                },
                {
                    onConflict: "id",
                },
            );

        if (upsertError) {
            return {
                error:
                    "Failed to create user record",
            };
        }


    } catch (error) {
        console.error(
            "[CREATE_USER_ERROR]",
            error,
        );

        return {
            error:
                "Failed to create user",
        };
    }
}
