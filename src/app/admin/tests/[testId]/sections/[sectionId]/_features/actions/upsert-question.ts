"use server";

import { createQuestionSchema } from "../zod/question.schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function upsertQuestion(
    testId: string,
    sectionId: string,
    rawInput: string,
    questionId?: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    await requireStaffServerOnly();
    try {
        // ----------------------------------
        // Parse Input
        // ----------------------------------
        let input: unknown;
        try {
            input = JSON.parse(rawInput);
        } catch {
            return { error: "Invalid question data" };
        }


        const supabase = await createServerSupabaseClient();

        // ----------------------------------
        // Validate Input
        // ----------------------------------
        const parsed = createQuestionSchema.safeParse(input);
        if (!parsed.success) {
            return { error: "Invalid question data" };
        }

        const values = parsed.data;

        // ----------------------------------
        // Verify Section Ownership
        // ----------------------------------
        const { data: section, error: sectionError } = await supabase
            .from("test_sections")
            .select("id, test_id")
            .eq("id", sectionId)
            .maybeSingle();

        if (sectionError || !section) {
            return { error: "Section not found" };
        }

        if (section.test_id !== testId) {
            return { error: "Section does not belong to this test" };
        }

        // ----------------------------------
        // Build Options Payload
        // ----------------------------------
        const optionsPayload = values.options
            ? values.options.map((o, idx) => ({
                label: o.label,
                text: JSON.parse(
                    JSON.stringify(
                        o.text ?? {
                            type: "doc",
                            content: [{ type: "paragraph" }],
                        }
                    )
                ),
                order: idx + 1,
            }))
            : null;

        // ----------------------------------
        // Build Correct Answer Payload
        // ----------------------------------
        let correctAnswerPayload: Record<string, unknown>;

        if (typeof values.correctAnswer === "string") {
            if (/^-?\d+(\.\d+)?$/.test(values.correctAnswer)) {
                // Numerical
                correctAnswerPayload = {
                    target: Number(values.correctAnswer),
                    tolerance: 0,
                };
            } else {
                // Single select or match-pairs
                correctAnswerPayload = {
                    label: values.correctAnswer,
                };
            }
        } else if (Array.isArray(values.correctAnswer)) {
            // Multi-select
            correctAnswerPayload = {
                labels: values.correctAnswer,
            };
        } else if (
            typeof values.correctAnswer === "object" &&
            values.correctAnswer !== null &&
            "target" in values.correctAnswer
        ) {
            // Numerical with tolerance
            correctAnswerPayload =
                values.correctAnswer as Record<string, unknown>;
        } else {
            return { error: "Invalid correct answer format" };
        }

        // ----------------------------------
        // RPC Payload
        // ----------------------------------
        const payload: Record<string, unknown> = {
            p_test_id: testId,
            p_section_id: sectionId,
            p_question_text: JSON.parse(
                JSON.stringify(
                    values.questionText ?? {
                        type: "doc",
                        content: [{ type: "paragraph" }],
                    }
                )
            ),
            p_explanation:
                values.explanation === null
                    ? null
                    : JSON.parse(JSON.stringify(values.explanation)),
            p_correct_answer: correctAnswerPayload,
            p_options: optionsPayload,
        };

        if (questionId) {
            payload.p_question_id = questionId;
        }

        // ----------------------------------
        // Execute RPC
        // ----------------------------------
        const { error } = await supabase.rpc(
            "rpc_upsert_test_question",
            payload
        );

        if (error) {
            console.error("[UPSERT_QUESTION_ERROR]", error);
            return {
                error: error.message || "Failed to save question",
            };
        }

        // Success: return nothing
    } catch (err) {
        console.error("[UPSERT_QUESTION_FATAL]", err);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
