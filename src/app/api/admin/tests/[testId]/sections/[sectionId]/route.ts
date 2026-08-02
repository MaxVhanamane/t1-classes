import { connection, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type { TestSection } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/types/section.types";

type SectionWithTest = {
    id: string;
    test_id: string;
    title: string;
    description: string | null;
    answer_mode: string;
    full_marks: number;
    negative_marks: number;
    partial_marks: Record<number, number> | null;
    sort_order: number;
    subject_label: string;

    // NEW COLUMNS
    section_total_questions: number;
    section_total_marks: number;

    tests: {
        is_locked: boolean;
    } | null;
};

type Props = {
    params: Promise<{
        testId: string;
        sectionId: string;
    }>;
};

export async function GET(
    _request: Request,
    { params }: Props,
) {
    await connection();

    try {
        /* ---------- Auth ---------- */
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Params ---------- */
        const { testId, sectionId } = await params;

        /* ---------- Client ---------- */
        const supabase = await createServerSupabaseClient();

        /* ---------- Query ---------- */
        const { data, error } = await supabase
            .from("test_sections")
            .select(
                `
        id,
        test_id,
        title,
        description,
        answer_mode,
        full_marks,
        negative_marks,
        partial_marks,
        sort_order,
        subject_label,
        section_total_questions,
        section_total_marks,
        tests (
          created_by,
          is_locked
        )
      `,
            )
            .eq("id", sectionId)
            .eq("test_id", testId)
            .single<SectionWithTest & {
                tests: {
                    created_by: string;
                    is_locked: boolean;
                } | null;
            }>();

        if (error || !data) {
            return NextResponse.json(
                {
                    message: "Section not found",
                },
                {
                    status: 404,
                },
            );
        }

        /* ---------- Ownership Check ---------- */
        if (
            auth.user.role === "teacher" &&
            data.tests?.created_by !== auth.user.userId
        ) {
            return NextResponse.json(
                {
                    message: "You do not have access to this section",
                },
                {
                    status: 403,
                },
            );
        }

        /* ---------- Transform ---------- */
        const section: TestSection = {
            id: data.id,
            testId: data.test_id,
            title: data.title,
            description: data.description,
            answerMode: data.answer_mode,
            fullMarks: Number(data.full_marks),
            negativeMarks: Number(data.negative_marks),
            partialMarks:
                (data.partial_marks as Record<number, number> | null) ??
                null,
            sortOrder: data.sort_order,
            subjectLabel: data.subject_label,
            is_locked: data.tests?.is_locked ?? false,
            sectionTotalQuestions: data.section_total_questions,
            sectionTotalMarks: data.section_total_marks,
        };

        return NextResponse.json(section);
    } catch (error) {
        console.error(
            "[ADMIN_SECTION_DETAILS_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message: "Failed to load section",
            },
            {
                status: 500,
            },
        );
    }
}
