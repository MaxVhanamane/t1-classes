"use server";


import { PostgrestError } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

import { CreateEnrollmentInput } from "../types/enrollments.types";
import { createEnrollmentSchema } from "../zod-schema/enrollments";

export async function updateEnrollment(
    enrollmentId: string,
    input: CreateEnrollmentInput,
): Promise<ServerActionResponse> {
    const staff =
        await requireAdminServerOnly();

    try {
        /* =====================================
           1. Validate Input
        ===================================== */

        const parsed =
            createEnrollmentSchema.safeParse(
                input,
            );

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]
                        ?.message ??
                    "Invalid enrollment data",
            };
        }

        const data =
            parsed.data;

        /* =====================================
           2. Client
        ===================================== */

        const supabase =
            await createServerSupabaseClient();

        /* =====================================
           3. Normalize Target
        ===================================== */

        const batchId =
            data.target_type ===
                "batch"
                ? data.batch_id ??
                null
                : null;

        const courseId =
            data.target_type ===
                "course"
                ? data.course_id ??
                null
                : null;

        /* =====================================
           4. Prevent Duplicate (excluding self)
           NULL-safe filters
        ===================================== */

        let duplicateQuery =
            supabase
                .from(
                    "enrollments",
                )
                .select("id")
                .eq(
                    "user_id",
                    data.user_id,
                )
                .eq(
                    "target_type",
                    data.target_type,
                )
                .neq(
                    "id",
                    enrollmentId,
                );

        duplicateQuery =
            batchId === null
                ? duplicateQuery.is(
                    "batch_id",
                    null,
                )
                : duplicateQuery.eq(
                    "batch_id",
                    batchId,
                );

        duplicateQuery =
            courseId === null
                ? duplicateQuery.is(
                    "course_id",
                    null,
                )
                : duplicateQuery.eq(
                    "course_id",
                    courseId,
                );

        const {
            data: existing,
            error:
            existingError,
        } =
            await duplicateQuery.maybeSingle();

        if (
            existingError
        ) {
            console.error(
                "[UPDATE_ENROLLMENT_PRECHECK]",
                existingError,
            );

            return {
                error:
                    "Failed to validate enrollment.",
            };
        }

        if (existing) {
            return {
                error:
                    data.target_type ===
                        "batch"
                        ? "User is already enrolled in this batch."
                        : "User is already enrolled in this course.",
            };
        }

        /* =====================================
           5. Update
        ===================================== */

        const {
            error,
        } = await supabase
            .from(
                "enrollments",
            )
            .update({
                user_id:
                    data.user_id,

                target_type:
                    data.target_type,

                batch_id:
                    batchId,

                course_id:
                    courseId,

                enrollment_type:
                    data.enrollment_type,

                registration_channel:
                    data.registration_channel,

                is_active:
                    data.is_active,

                deactivation_reason:
                    data.is_active
                        ? null
                        : data.deactivation_reason ??
                        null,

                access_starts_at:
                    data.access_starts_at,

                access_ends_at:
                    data.access_ends_at ??
                    null,

                notes:
                    data.notes ??
                    null,

                updated_by:
                    staff.userId,
            })
            .eq(
                "id",
                enrollmentId,
            );

        /* =====================================
           6. Unique Violation Safe
        ===================================== */

        if (error) {
            const pgError =
                error as PostgrestError;

            if (
                pgError.code ===
                "23505"
            ) {
                return {
                    error:
                        data.target_type ===
                            "batch"
                            ? "User is already enrolled in this batch."
                            : "User is already enrolled in this course.",
                };
            }

            console.error(
                "[UPDATE_ENROLLMENT_DB]",
                pgError,
            );

            return {
                error:
                    "Failed to update enrollment.",
            };
        }




    } catch (error) {
        console.error(
            "[UPDATE_ENROLLMENT_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
