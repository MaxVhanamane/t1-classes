import { connection, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

import type { SectionTemplate } from "@/src/app/admin/tests/[testId]/_features/types/section-template.types";

type SectionTemplateRow = {
    id: string;

    name: string;

    description: string;

    answer_mode: SectionTemplate["answerMode"];

    max_selections: number | null;

    default_full_marks: number;

    default_negative_marks: number;

    default_partial_marks:
    | SectionTemplate["defaultPartialMarks"]
    | null;
};

export async function GET() {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Client ---------- */

        const supabase = await createServerSupabaseClient();

        /* ---------- Query ---------- */

        const { data, error } = await supabase
            .from("test_section_templates")
            .select(
                `
        id,
        name,
        description,
        answer_mode,
        max_selections,
        default_full_marks,
        default_negative_marks,
        default_partial_marks
      `,
            )
            .eq("is_active", true)
            .order("sort_order", {
                ascending: true,
            })
            .overrideTypes<
                SectionTemplateRow[],
                {
                    merge: false;
                }
            >();

        if (error) {
            throw new Error(error.message);
        }

        /* ---------- Transform ---------- */

        const templates: SectionTemplate[] = (data ?? []).map((template) => ({
            id: template.id,

            name: template.name,

            description: template.description,

            answerMode: template.answer_mode,

            maxSelections: template.max_selections,

            defaultFullMarks: Number(
                template.default_full_marks,
            ),

            defaultNegativeMarks: Number(
                template.default_negative_marks,
            ),

            defaultPartialMarks:
                template.default_partial_marks,
        }));

        return NextResponse.json(templates);
    } catch (error) {
        console.error(
            "[ADMIN_SECTION_TEMPLATES_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load section templates",
            },
            {
                status: 500,
            },
        );
    }
}
