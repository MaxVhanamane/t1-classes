"use server";

import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import {
    createQuestionSchema,
} from "../zod/question.schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { redirect } from "next/navigation";

export async function upsertQuestion(
    testId: string,
    sectionId: string,
    rawInput: string,
    questionId?: string
) {
    // ----------------------------------
    // Auth
    // ----------------------------------
    // Parse the stringified input back to object
    let input: unknown;
    try {
        input = JSON.parse(rawInput);
    } catch {
        throw new Error("INVALID_QUESTION_DATA");
    }
    const user = await getAuthIfHasRole(["admin", "teacher"]);
    if (!user) {
        redirect("/login")
    }
    const supabase = await createServerSupabaseClient();

    // ----------------------------------
    // Validate Input
    // ----------------------------------
    const parsed = createQuestionSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error("INVALID_QUESTION_DATA");
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
        throw new Error("SECTION_NOT_FOUND");
    }

    if (section.test_id !== testId) {
        throw new Error("SECTION_TEST_MISMATCH");
    }

    // ----------------------------------
    // Build Options Payload
    // ----------------------------------
    const optionsPayload = values.options
        ? values.options.map((o, idx) => ({
            label: o.label,
            text: JSON.parse(JSON.stringify(
                o.text ?? { type: "doc", content: [{ type: "paragraph" }] }
            )),
            order: idx + 1,
        }))
        : null;
    // ----------------------------------
    // Build Correct Answer Payload
    // FRONTEND SENDS LABELS, RPC CONVERTS TO UUIDs
    // ----------------------------------
    let correctAnswerPayload: Record<string, unknown>;

    if (typeof values.correctAnswer === "string") {
        // Either MCQ label OR numeric string
        if (/^-?\d+(\.\d+)?$/.test(values.correctAnswer)) {
            // Numerical
            correctAnswerPayload = {
                target: Number(values.correctAnswer),
                tolerance: 0,
            };
        } else {
            // Single select OR match-pairs MCQ
            correctAnswerPayload = {
                label: values.correctAnswer, // "A", "B", "C", "D"
            };
        }
    } else if (Array.isArray(values.correctAnswer)) {
        // Multi select
        correctAnswerPayload = {
            labels: values.correctAnswer, // ["A","C","D"]
        };
    } else if (
        typeof values.correctAnswer === "object" &&
        values.correctAnswer !== null &&
        "target" in values.correctAnswer
    ) {
        // Numerical with tolerance
        correctAnswerPayload = values.correctAnswer as Record<string, unknown>;
    } else {
        throw new Error("INVALID_CORRECT_ANSWER_FORMAT");
    }

    // ----------------------------------
    // RPC Payload
    // ----------------------------------
    const payload: Record<string, unknown> = {
        p_test_id: testId,
        p_section_id: sectionId,
        p_question_text: JSON.parse(JSON.stringify(
            values.questionText ?? { type: "doc", content: [{ type: "paragraph" }] }
        )),
        p_explanation: JSON.parse(JSON.stringify(
            values.explanation ?? { type: "doc", content: [{ type: "paragraph" }] }
        )),
        p_correct_answer: correctAnswerPayload,
        p_options: optionsPayload,
    };


    if (questionId) {
        payload.p_question_id = questionId;
    }

    // ----------------------------------
    // Execute RPC
    // ----------------------------------
    const { data, error } = await supabase.rpc(
        "rpc_upsert_test_question",
        payload
    );

    if (error || !data) {
        throw new Error(error?.message || "Failed to save question");
    }



    return {
        success: true,
        questionId: data as string,
    };
}
