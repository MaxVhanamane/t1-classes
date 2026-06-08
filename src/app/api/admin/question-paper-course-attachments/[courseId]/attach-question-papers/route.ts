import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

type RouteContext = {
    params: Promise<{
        courseId: string;
    }>;
};

type RequestBody = {
    questionPaperIds: string[];
};

export async function POST(
    request: NextRequest,
    { params }: RouteContext,
) {
    try {
        const auth =
            await requireAdminApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const { courseId } =
            await params;

        const body =
            (await request.json()) as RequestBody;

        if (
            !Array.isArray(
                body.questionPaperIds,
            ) ||
            body.questionPaperIds.length ===
            0
        ) {
            return NextResponse.json(
                {
                    message:
                        "At least one question paper must be selected.",
                },
                {
                    status: 400,
                },
            );
        }

        const supabase =
            await createServerSupabaseClient();

        const rows =
            body.questionPaperIds.map(
                (
                    questionPaperId,
                ) => ({
                    course_id: courseId,
                    question_paper_id:
                        questionPaperId,
                    created_by:
                        auth.user.userId,
                }),
            );

        const { error } =
            await supabase
                .from(
                    "course_question_papers",
                )
                .upsert(
                    rows,
                    {
                        onConflict:
                            "course_id,question_paper_id",
                        ignoreDuplicates:
                            true,
                    },
                );

        if (error) {
            return NextResponse.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            message:
                "Question papers attached successfully.",
        });
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to attach question papers.",
            },
            {
                status: 500,
            },
        );
    }
}
