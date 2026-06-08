"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { ServerActionResponse } from "@/src/types/server-action";

import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

import {
    questionPaperSchema,
} from "../zod/question-paper.schema";

import { deleteR2Object } from "@/src/lib/r2/deleteObject";

const R2_PRIVATE_BUCKET_NAME =
    process.env.R2_PRIVATE_BUCKET_NAME!;

export async function updateQuestionPaper(
    questionPaperId: string,
    input: unknown,
): Promise<
    ServerActionResponse<void>
> {
    const admin =
        await requireAdminServerOnly();

    try {
        /* ---------- validate ---------- */

        const parsed =
            questionPaperSchema.safeParse(
                input,
            );

        if (
            !parsed.success
        ) {
            return {
                error:
                    parsed.error
                        .issues[0]
                        ?.message ??
                    "Invalid question paper data",
            };
        }

        const values =
            parsed.data;

        const supabase =
            await createServerSupabaseClient();

        /* ---------- existing ---------- */

        const {
            data: existing,
            error: existingError,
        } =
            await supabase
                .from(
                    "question_papers",
                )
                .select(
                    "file_path",
                )
                .eq(
                    "id",
                    questionPaperId,
                )
                .single();

        if (
            existingError ||
            !existing
        ) {
            console.error(
                "[GET_QUESTION_PAPER_ERROR]",
                existingError,
            );

            return {
                error:
                    "Question paper not found.",
            };
        }

        const oldFilePath =
            existing.file_path;

        /* ---------- update ---------- */

        const {
            error,
        } =
            await supabase
                .from(
                    "question_papers",
                )
                .update({
                    title:
                        values.title,

                    description:
                        values.description ??
                        null,

                    class_level:
                        values.class_level ??
                        null,

                    target_exam:
                        values.target_exam,

                    subject:
                        values.subject,

                    paper_category:
                        values.paper_category,

                    years:
                        values.years,

                    file_path:
                        values.file_path,

                    file_size:
                        values.file_size ??
                        null,

                    updated_by:
                        admin.userId,
                })
                .eq(
                    "id",
                    questionPaperId,
                );

        if (
            error
        ) {
            console.error(
                "[UPDATE_QUESTION_PAPER_ERROR]",
                error,
            );

            return {
                error:
                    "Failed to update question paper.",
            };
        }

        /* ---------- delete old pdf ---------- */

        if (
            oldFilePath &&
            values.file_path &&
            oldFilePath !==
            values.file_path
        ) {
            await deleteR2Object(
                R2_PRIVATE_BUCKET_NAME,
                oldFilePath,
            );
        }

        return {
            data: undefined,
        };
    } catch (
    error
    ) {
        console.error(
            "[UPDATE_QUESTION_PAPER_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
