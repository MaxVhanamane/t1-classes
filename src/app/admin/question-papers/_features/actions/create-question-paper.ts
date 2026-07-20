"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { ServerActionResponse } from "@/src/types/server-action";

import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

import {
    questionPaperSchema,
} from "../zod/question-paper.schema";

export async function createQuestionPaper(
    input: unknown,
): Promise<
    ServerActionResponse<string>
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

        /* ---------- insert ---------- */

        const {
            data,
            error,
        } =
            await supabase
                .from(
                    "question_papers",
                )
                .insert({
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

                    created_by:
                        admin.userId,
                })
                .select(
                    "id",
                )
                .single();

        if (
            error ||
            !data
        ) {
            console.error(
                "[CREATE_QUESTION_PAPER_ERROR]",
                error,
            );

            return {
                error:
                    "Failed to create question paper.",
            };
        }

        return {
            data: data.id,
        };
    } catch (
    error
    ) {
        console.error(
            "[CREATE_QUESTION_PAPER_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
