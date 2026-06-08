"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { ServerActionResponse } from "@/src/types/server-action";

import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";



export async function deleteQuestionPaper(
    questionPaperId: string,
): Promise<
    ServerActionResponse<void>
> {
    await requireAdminServerOnly();

    try {
        const supabase =
            await createServerSupabaseClient();

        /* ---------- load paper ---------- */

        const {
            data: paper,
            error: paperError,
        } = await supabase
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
            paperError ||
            !paper
        ) {
            console.error(
                "[DELETE_QUESTION_PAPER_LOAD_ERROR]",
                paperError,
            );

            return {
                error:
                    "Question paper not found.",
            };
        }

        /* ---------- delete db record ---------- */

        const {
            error:
            deleteError,
        } =
            await supabase
                .from(
                    "question_papers",
                )
                .delete()
                .eq(
                    "id",
                    questionPaperId,
                );

        if (
            deleteError
        ) {
            console.error(
                "[DELETE_QUESTION_PAPER_ERROR]",
                deleteError,
            );

            return {
                error:
                    "Failed to delete question paper.",
            };
        }

        /* ---------- cleanup r2 ---------- */

        await deleteR2Object(
            process.env
                .R2_PRIVATE_BUCKET_NAME!,
            paper.file_path,
        );


    } catch (
    error
    ) {
        console.error(
            "[DELETE_QUESTION_PAPER_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
