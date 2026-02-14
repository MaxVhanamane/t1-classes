import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStudent } from "@/src/lib/helper-functions/getCurrentStudent";
import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";

/* --------------------------------------------- */
/* Types */
/* --------------------------------------------- */

type AttemptRow = {
    id: string;
    test_id: string;
    distribution_id: string;
    user_id: string;
};

type DistributionRow = {
    id: string;
    batch_id: string | null;
    course_id: string | null;
};
export type PartialMarkingByCorrectCount = {
    type: "by_correct_count";
    rules: {
        marks: number;
        minCorrect: number;
    }[];
};

type SectionRow = {
    id: string;
    title: string;
    subject_label: string;
    sort_order: number;
    answer_mode:
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix";
    full_marks: number;
    negative_marks: number;
    partial_marks: PartialMarkingByCorrectCount | null;
    max_selections: number | null;
    scoring_question_count: number | null;
};

type SectionsResponse =
    | {
        kind: "ok";
        sections: {
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
            partialMarks: unknown | null;
            maxSelections: number | null;
            scoringQuestionCount: number | null;

            questionCount: number;
        }[];
    }
    | {
        kind: "denied";
        reason: "not_found" | "not_owner" | "not_enrolled";
    };

/* --------------------------------------------- */
/* Handler */
/* --------------------------------------------- */

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentStudent();
    const { attemptId } = await params;

    /* ------------------------------------------- */
    /* 1. Attempt */
    /* ------------------------------------------- */

    const { data: attempt } = await supabase
        .from("test_attempts")
        .select("id, test_id, distribution_id, user_id")
        .eq("id", attemptId)
        .single();

    if (!attempt) {
        return NextResponse.json<SectionsResponse>(
            { kind: "denied", reason: "not_found" },
            { status: 404 }
        );
    }

    const typedAttempt = attempt as AttemptRow;

    if (typedAttempt.user_id !== user.id) {
        return NextResponse.json<SectionsResponse>(
            { kind: "denied", reason: "not_owner" },
            { status: 403 }
        );
    }

    /* ------------------------------------------- */
    /* 2. Enrollment */
    /* ------------------------------------------- */

    const { data: dist } = await supabase
        .from("test_distributions")
        .select("id, batch_id, course_id")
        .eq("id", typedAttempt.distribution_id)
        .single();

    if (!dist) {
        return NextResponse.json<SectionsResponse>(
            { kind: "denied", reason: "not_found" },
            { status: 404 }
        );
    }

    const distribution = dist as DistributionRow;

    if (distribution.batch_id) {
        const access = await getEnrollmentAccess(
            supabase,
            user.id,
            {
                type: "batch",
                batchId: distribution.batch_id,
            }
        );

        if (!access.hasAccess) {
            return NextResponse.json<SectionsResponse>(
                { kind: "denied", reason: "not_enrolled" },
                { status: 403 }
            );
        }
    }

    if (distribution.course_id) {
        const access = await getEnrollmentAccess(
            supabase,
            user.id,
            {
                type: "course",
                courseId: distribution.course_id,
            }
        );

        if (!access.hasAccess) {
            return NextResponse.json<SectionsResponse>(
                { kind: "denied", reason: "not_enrolled" },
                { status: 403 }
            );
        }
    }

    /* ------------------------------------------- */
    /* 3. Sections */
    /* ------------------------------------------- */

    const { data: sections } = await supabase
        .from("test_sections")
        .select(
            `
      id,
      title,
      subject_label,
      sort_order,
      answer_mode,
      full_marks,
      negative_marks,
      partial_marks,
      max_selections,
      scoring_question_count
    `
        )
        .eq("test_id", typedAttempt.test_id)
        .eq("is_active", true)
        .order("sort_order");

    const typedSections = sections as SectionRow[] | null;

    if (!typedSections?.length) {
        return NextResponse.json<SectionsResponse>({
            kind: "ok",
            sections: [],
        });
    }

    /* ------------------------------------------- */
    /* 4. Question Counts */
    /* ------------------------------------------- */

    const sectionIds = typedSections.map((s) => s.id);

    const { data: counts } = await supabase
        .from("test_questions")
        .select("section_id, id")
        .in("section_id", sectionIds);

    const countMap = new Map<string, number>();

    for (const row of counts ?? []) {
        const key = row.section_id;
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }

    /* ------------------------------------------- */
    /* 5. Response */
    /* ------------------------------------------- */

    return NextResponse.json<SectionsResponse>({
        kind: "ok",
        sections: typedSections.map((s) => ({
            id: s.id,
            title: s.title,
            subjectLabel: s.subject_label,
            sortOrder: s.sort_order,
            answerMode: s.answer_mode,
            fullMarks: Number(s.full_marks),
            negativeMarks: Number(s.negative_marks),
            partialMarks: s.partial_marks,
            maxSelections: s.max_selections,
            scoringQuestionCount: s.scoring_question_count,
            questionCount: countMap.get(s.id) ?? 0,
        })),
    });
}
