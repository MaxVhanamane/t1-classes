import { connection, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";
import type { TestBuilderTest } from "@/src/app/admin/tests/[testId]/_features/types/test-builder.types";
import type { TestSection } from "@/src/app/admin/tests/[testId]/_features/types/test-section.types";

type TestDetailsRow = {
    id: string;
    title: string;
    description: string | null;
    test_type: "standard" | "sectioned";
    is_active: boolean;
    is_locked: boolean;
    created_by: string;
    test_sections: {
        id: string;
        test_id: string;
        title: string;
        description: string | null;
        answer_mode:
        | "single_select"
        | "multi_select"
        | "numerical_input"
        | "match_matrix";
        full_marks: number;
        negative_marks: number;
        partial_marks: Record<number, number> | null;
        sort_order: number;
        subject_label: string;

    }[];
};

export async function GET(
    _: Request,
    {
        params,
    }: {
        params: Promise<{
            testId: string;
        }>;
    },
) {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Params ---------- */

        const { testId } = await params;

        /* ---------- Client ---------- */

        const supabase = await createServerSupabaseClient();

        /* ---------- Query ---------- */

        let query = supabase
            .from("tests")
            .select(
                `
        id,
        title,
        description,
        test_type,
        is_active,
        is_locked,
        created_by,

        test_sections (
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
        
        )
      `,
            )
            .eq("id", testId);

        /*
         * Teachers can only access their own tests.
         * Admins can access everything.
         */

        if (auth.user.role !== "admin") {
            query = query.eq("created_by", auth.user.userId);
        }

        const { data, error } = await query
            .single()
            .overrideTypes<TestDetailsRow, { merge: false }>();

        if (error || !data) {
            return NextResponse.json(
                {
                    message: "Test not found",
                },
                {
                    status: 404,
                },
            );
        }

        /* ---------- Transform ---------- */

        const test: TestBuilderTest = {
            id: data.id,

            title: data.title,

            description: data.description,

            test_type: data.test_type,

            is_active: data.is_active,

            is_locked: data.is_locked,
        };

        const sections: TestSection[] =
            data.test_sections.map((section) => ({
                id: section.id,

                testId: section.test_id,

                title: section.title,

                description: section.description,

                answerMode: section.answer_mode,

                fullMarks: Number(section.full_marks),

                negativeMarks: Number(section.negative_marks),

                partialMarks: section.partial_marks,

                sortOrder: section.sort_order,

                subjectLabel: section.subject_label,

            })) ?? [];

        return NextResponse.json({
            test,

            sections,
        });
    } catch (error) {
        console.error("[ADMIN_TEST_DETAILS_ERROR]", error);

        return NextResponse.json(
            {
                message: "Failed to load test details",
            },
            {
                status: 500,
            },
        );
    }
}
