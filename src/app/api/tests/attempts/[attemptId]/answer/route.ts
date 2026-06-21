import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { SaveAnswerBody, SaveAnswerSchema } from "./zod.answer.schema";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ attemptId: string }> },
) {
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const supabase = await createServerSupabaseClient();
    const attemptId = (await params).attemptId;

    let body: SaveAnswerBody;

    try {
        body = SaveAnswerSchema.parse(await req.json());
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 },
        );
    }

    const { questionId, answer, markedForReview, timeSpentSeconds } = body;
    const { data, error } =
        await supabase.rpc(
            "save_test_answer",
            {
                p_attempt_id: attemptId,
                p_question_id: questionId,
                p_answer: answer,
                p_marked_for_review:
                    markedForReview ?? false,
                p_time_spent_seconds:
                    timeSpentSeconds,
            },
        );
    if (error) {
        const message = error.message.toLowerCase();


        if (message.includes("attempt not found")) {
            return NextResponse.json(
                { error: "Attempt not found" },
                { status: 404 },
            );
        }

        if (
            message.includes("attempt expired") ||
            message.includes("attempt is not active")
        ) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 },
            );
        }

        if (error.code === "23503") {
            return NextResponse.json(
                { error: "Invalid question" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to save answer" },
            { status: 500 },
        );
    }

    console.log({
        ok: true,
        attemptId,
        questionId,
        savedAt: data?.[0]?.saved_at ?? null,
        markedForReview: data?.[0]?.marked_for_review ?? false,
        timeSpentSeconds:
            data?.[0]?.time_spent_seconds,
    })

    return NextResponse.json({
        ok: true,
        attemptId,
        questionId,
        savedAt: data?.[0]?.saved_at ?? null,
        markedForReview: data?.[0]?.marked_for_review ?? false,
        timeSpentSeconds:
            data?.[0]?.time_spent_seconds ?? 0,
    });
}
