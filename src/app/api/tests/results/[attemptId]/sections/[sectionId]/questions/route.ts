import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import { QuestionsPageResponse } from "@/src/app/student/tests/results/[attemptId]/detailed/_features/types/question-details.types";

/* =========================================================
   ROUTE
========================================================= */

export const PAGE_LIMIT = 25;

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            attemptId: string;
            sectionId: string;
        }>;
    }
) {
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const supabase = await createServerSupabaseClient();
    const { attemptId, sectionId } = await params;

    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = PAGE_LIMIT;

    const { data, error } = await supabase.rpc(
        "get_attempt_section_answer_review",
        {
            p_attempt_id: attemptId,
            p_section_id: sectionId,
            p_page: page,
            p_limit: limit,
        }
    );

    if (error) {
        console.error("get_attempt_section_answer_review error:", error);
        return NextResponse.json<QuestionsPageResponse>(
            { kind: "denied", reason: "not_found" },
            { status: 500 }
        );
    }

    const result = data as QuestionsPageResponse | null;

    if (!result) {
        return NextResponse.json<QuestionsPageResponse>(
            { kind: "denied", reason: "not_found" },
            { status: 404 }
        );
    }

    if (result.kind === "denied") {
        const status =
            result.reason === "not_owner"
                ? 403
                : result.reason === "not_enrolled"
                    ? 403
                    : 404;

        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, {
        status: 200,
        headers: {
            "Cache-Control": "private, no-store",
        },
    });
}
