import {
    connection,
    NextResponse,
} from "next/server";

import {
    createServerSupabaseClient,
} from "@/src/lib/supabase/supabase-server";

import {
    requireStudentApiRoute,
} from "@/src/lib/auth/require-role-api-route";

type PaperCategory =
    | "previous_year"
    | "practice";

type CourseQuestionPaperRpcRow = {
    id: string;

    title: string;

    target_exam: string | null;

    subject: string | null;

    paper_category: PaperCategory;

    years: number[];

    class_level: number | null;

    description: string | null;

    file_path: string;

    file_size: number | null;

    total_count: number;
};

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            courseId: string;
        }>;
    },
) {
    await connection();

    const auth =
        await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const supabase =
        await createServerSupabaseClient();

    const courseId =
        (await params).courseId;

    const { searchParams } =
        new URL(req.url);

    const rawPage = Number(
        searchParams.get("page") ??
        "1",
    );

    const paperCategory =
        (searchParams.get(
            "paperCategory",
        ) as PaperCategory | null) ??
        "previous_year";

    if (
        paperCategory !==
        "previous_year" &&
        paperCategory !==
        "practice"
    ) {
        return NextResponse.json(
            {
                error:
                    "Invalid paper category",
            },
            {
                status: 400,
            },
        );
    }

    const page =
        Number.isFinite(rawPage) &&
            rawPage > 0
            ? rawPage
            : 1;

    const limit = 1;

    const {
        data,
        error,
    } = await supabase.rpc(
        "get_student_course_question_papers",
        {
            p_student_id:
                auth.user.userId,

            p_course_id:
                courseId,

            p_paper_category:
                paperCategory,

            p_page:
                page,

            p_limit:
                limit,
        },
    );

    if (error) {
        console.error(
            "[FETCH_COURSE_QUESTION_PAPERS_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error.message ===
                        "Access denied"
                        ? "Access denied"
                        : "Failed to load question papers",
            },
            {
                status:
                    error.message ===
                        "Access denied"
                        ? 403
                        : 500,
            },
        );
    }

    const rows =
        (data as
            | CourseQuestionPaperRpcRow[]
            | null) ?? [];

    const total =
        rows[0]?.total_count ??
        0;

    return NextResponse.json({
        items: rows.map(
            (row) => ({
                id: row.id,

                title: row.title,

                targetExam:
                    row.target_exam,

                subject:
                    row.subject,

                paperCategory:
                    row.paper_category,

                years:
                    row.years,

                classLevel:
                    row.class_level,

                description:
                    row.description,

                filePath:
                    row.file_path,

                fileSize:
                    row.file_size,
            }),
        ),

        page,

        total,

        totalPages:
            Math.ceil(
                total / limit,
            ),

        pageSize: limit,
    });
}
