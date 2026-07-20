import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

/* --------------------------------------------- */
/* Types */
/* --------------------------------------------- */

export type PartialMarkingByCorrectCount = {
    type: "by_correct_count";
    rules: {
        marks: number;
        minCorrect: number;
    }[];
};

export type SectionOverview = {
    id: string;
    title: string;
    subjectLabel: string;
    sortOrder: number;

    answerMode:
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix";

    fullMarks: number;
    negativeMarks: number;
    partialMarks: PartialMarkingByCorrectCount | null;
    maxSelections: number | null;

    questionCount: number;
};

export type SectionsResponse =
    | {
        kind: "ok";
        sections: SectionOverview[];
    }
    | {
        kind: "denied";
        reason:
        | "not_found"
        | "not_owner"
        | "not_enrolled";
    };

/* --------------------------------------------- */
/* Handler */
/* --------------------------------------------- */

export async function GET(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{
            attemptId: string;
        }>;
    }
) {
    const auth =
        await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const { attemptId } =
        await params;

    const supabase =
        await createServerSupabaseClient();

    const { data, error } =
        await supabase.rpc("get_my_attempt_sections_overview", {
            p_attempt_id: attemptId,
        });

    if (error) {
        console.error(
            "get_my_attempt_sections_overview error:",
            error
        );

        return NextResponse.json<SectionsResponse>(
            {
                kind: "denied",
                reason: "not_found",
            },
            { status: 500 }
        );
    }

    const result =
        data as SectionsResponse | null;

    if (!result) {
        return NextResponse.json<SectionsResponse>(
            {
                kind: "denied",
                reason: "not_found",
            },
            { status: 404 }
        );
    }

    if (result.kind === "denied") {
        const status =
            result.reason ===
                "not_owner"
                ? 403
                : result.reason ===
                    "not_enrolled"
                    ? 403
                    : 404;

        return NextResponse.json(
            result,
            { status }
        );
    }

    return NextResponse.json<
        SectionsResponse
    >(result, {
        status: 200,
        headers: {
            "Cache-Control":
                "private, no-store",
        },
    });
}

