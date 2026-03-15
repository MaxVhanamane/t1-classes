import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStudent } from "@/src/lib/helper-functions/getCurrentStudent";
import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";
import { JSONContent } from "@tiptap/react"
/* =========================================================
   FRONTEND-ALIGNED EXPORTED TYPES (UNCHANGED + ADDITION)
========================================================= */

export type OptionReview = {
    id: string;
    label: string;
    text: JSONContent;
    isCorrect: boolean;
    isSelected: boolean;
};

export type QuestionReview = {
    id: string;
    questionText: JSONContent;
    explanation: string | null;
    options: OptionReview[];
    marksAwarded: number;
    isCorrect: boolean;

    /*  FOR NUMERICAL QUESTIONS */
    numericalMeta?: {
        target: number;
        tolerance: number;
        studentValue: number | null;
    };
};

export type QuestionsPageResponse =
    | {
        kind: "ok";
        page: number;
        totalPages: number;
        questions: QuestionReview[];
    }
    | {
        kind: "denied";
        reason: "not_found" | "not_owner" | "not_enrolled";
    };

/* =========================================================
   DB ROW TYPES
========================================================= */

type AttemptRow = {
    id: string;
    test_id: string;
    distribution_id: string;
    user_id: string;
};

type DistributionRow = {
    id: string;
    batch_id: string | null;
};

type SectionRow = {
    id: string;
    answer_mode:
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix";
    full_marks: number;
    negative_marks: number;
    partial_marks: {
        type: string;
        rules: {
            minCorrect: number;
            marks: number;
        }[];
    } | null;
};

type QuestionRow = {
    id: string;
    question_text: JSONContent;
    explanation: string | null;
    correct_answer: unknown;
    sort_order: number;
};

type AnswerRow = {
    question_id: string;
    answer: unknown | null;
};

type OptionRow = {
    id: string;
    question_id: string;
    option_label: string;
    option_text: JSONContent;
    sort_order: number;
};

/* =========================================================
   ANSWER TYPE GUARDS
========================================================= */

type SingleAnswer = { option_id: string };
type MultiAnswer = { option_ids: string[] };
type NumericalAnswer = { value: number };
type NumericalCorrect = { target: number; tolerance: number };

function isSingleAnswer(value: unknown): value is SingleAnswer {
    return (
        typeof value === "object" &&
        value !== null &&
        "option_id" in value
    );
}

function isMultiAnswer(value: unknown): value is MultiAnswer {
    return (
        typeof value === "object" &&
        value !== null &&
        "option_ids" in value
    );
}

function isNumericalAnswer(
    value: unknown
): value is NumericalAnswer {
    return (
        typeof value === "object" &&
        value !== null &&
        "value" in value
    );
}

function isNumericalCorrect(
    value: unknown
): value is NumericalCorrect {
    return (
        typeof value === "object" &&
        value !== null &&
        "target" in value
    );
}

/* =========================================================
   SCORING ENGINE (UNCHANGED)
========================================================= */

function calculateMarks(
    section: SectionRow,
    correct: unknown,
    student: unknown | null
): { marks: number; isCorrect: boolean } {
    if (!student) {
        return { marks: 0, isCorrect: false };
    }

    /* SINGLE / MATCH */

    if (
        section.answer_mode === "single_select" ||
        section.answer_mode === "match_matrix"
    ) {
        if (
            isSingleAnswer(correct) &&
            isSingleAnswer(student)
        ) {
            if (
                correct.option_id ===
                student.option_id
            ) {
                return {
                    marks: section.full_marks,
                    isCorrect: true,
                };
            }
        }

        return {
            marks: section.negative_marks,
            isCorrect: false,
        };
    }

    /* MULTI */

    if (
        section.answer_mode === "multi_select" &&
        isMultiAnswer(correct) &&
        isMultiAnswer(student)
    ) {
        const correctIds = correct.option_ids;
        const studentIds = student.option_ids;

        const hasWrong = studentIds.some(
            (id) => !correctIds.includes(id)
        );

        if (hasWrong) {
            return {
                marks: section.negative_marks,
                isCorrect: false,
            };
        }

        const fullyCorrect =
            studentIds.length ===
            correctIds.length &&
            studentIds.every((id) =>
                correctIds.includes(id)
            );

        if (fullyCorrect) {
            return {
                marks: section.full_marks,
                isCorrect: true,
            };
        }

        const correctCount =
            studentIds.filter((id) =>
                correctIds.includes(id)
            ).length;

        const rules =
            section.partial_marks?.rules ?? [];

        const matchedRule = [...rules]
            .sort(
                (a, b) =>
                    b.minCorrect - a.minCorrect
            )
            .find(
                (r) =>
                    correctCount >= r.minCorrect
            );

        return {
            marks: matchedRule?.marks ?? 0,
            isCorrect: false,
        };
    }

    /* NUMERICAL */

    if (
        section.answer_mode ===
        "numerical_input" &&
        isNumericalCorrect(correct) &&
        isNumericalAnswer(student)
    ) {
        const diff = Math.abs(
            student.value - correct.target
        );

        if (diff <= correct.tolerance) {
            return {
                marks: section.full_marks,
                isCorrect: true,
            };
        }

        return {
            marks: section.negative_marks,
            isCorrect: false,
        };
    }

    return { marks: 0, isCorrect: false };
}

/* =========================================================
   HANDLER
========================================================= */

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
    const supabase =
        await createServerSupabaseClient();
    const user =
        await getCurrentStudent();
    const { attemptId, sectionId } =
        await params;

    const url = new URL(req.url);

    const page = Number(
        url.searchParams.get("page") ?? 1
    );

    const limit = Number(
        url.searchParams.get("limit") ?? 10
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* Attempt */

    const { data: attempt } =
        await supabase
            .from("test_attempts")
            .select(
                "id, test_id, distribution_id, user_id"
            )
            .eq("id", attemptId)
            .single();

    if (!attempt) {
        return NextResponse.json(
            {
                kind: "denied",
                reason: "not_found",
            },
            { status: 404 }
        );
    }

    const typedAttempt =
        attempt as AttemptRow;

    if (
        typedAttempt.user_id !== user.id
    ) {
        return NextResponse.json(
            {
                kind: "denied",
                reason: "not_owner",
            },
            { status: 403 }
        );
    }

    /* Enrollment */

    const { data: dist } =
        await supabase
            .from("test_distributions")
            .select(
                "id, batch_id"
            )
            .eq(
                "id",
                typedAttempt.distribution_id
            )
            .single();

    if (!dist) {
        return NextResponse.json(
            {
                kind: "denied",
                reason: "not_found",
            },
            { status: 404 }
        );
    }

    const distribution =
        dist as DistributionRow;

    if (distribution.batch_id) {
        const access =
            await getEnrollmentAccess(
                supabase,
                user.id,
                {
                    type: "batch",
                    batchId:
                        distribution.batch_id,
                }
            );

        if (!access.hasAccess) {
            return NextResponse.json(
                {
                    kind: "denied",
                    reason: "not_enrolled",
                },
                { status: 403 }
            );
        }
    }

    /* Section */

    const { data: section } =
        await supabase
            .from("test_sections")
            .select(
                `
        id,
        answer_mode,
        full_marks,
        negative_marks,
        partial_marks
      `
            )
            .eq("id", sectionId)
            .single();

    if (!section) {
        return NextResponse.json(
            {
                kind: "denied",
                reason: "not_found",
            },
            { status: 404 }
        );
    }

    const typedSection =
        section as SectionRow;

    /* Count */

    const { count } =
        await supabase
            .from("test_questions")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq(
                "test_id",
                typedAttempt.test_id
            )
            .eq("section_id", sectionId);

    const totalPages = Math.ceil(
        (count ?? 0) / limit
    );

    /* Questions */

    const { data: questions } =
        await supabase
            .from("test_questions")
            .select(
                `
        id,
        question_text,
        explanation,
        correct_answer,
        sort_order
      `
            )
            .eq(
                "test_id",
                typedAttempt.test_id
            )
            .eq("section_id", sectionId)
            .order("sort_order")
            .range(from, to)
            .overrideTypes<QuestionRow[]>();

    const typedQuestions =
        questions ?? [];

    /* Answers */

    const { data: answers } =
        await supabase
            .from(
                "test_attempt_answers"
            )
            .select(
                "question_id, answer"
            )
            .eq(
                "attempt_id",
                attemptId
            );

    const answerMap = new Map<
        string,
        unknown | null
    >(
        (answers as
            | AnswerRow[]
            | null)?.map((a) => [
                a.question_id,
                a.answer,
            ]) ?? []
    );

    /* Options */

    const questionIds =
        typedQuestions.map(
            (q) => q.id
        );

    const { data: options } =
        await supabase
            .from(
                "test_question_options"
            )
            .select(
                `
        id,
        question_id,
        option_label,
        option_text,
        sort_order
      `
            )
            .in(
                "question_id",
                questionIds
            )
            .order("sort_order");

    const optionMap = new Map<
        string,
        OptionRow[]
    >();

    for (const opt of options ?? []) {
        if (
            !optionMap.has(
                opt.question_id
            )
        ) {
            optionMap.set(
                opt.question_id,
                []
            );
        }

        optionMap
            .get(opt.question_id)!
            .push(opt);
    }

    /* =====================================================
       Build Payload (ONLY ADDITION IS numericalMeta)
    ===================================================== */

    const questionsPayload: QuestionReview[] =
        typedQuestions.map((q) => {
            const studentRaw =
                answerMap.get(q.id) ??
                null;

            const scoring =
                calculateMarks(
                    typedSection,
                    q.correct_answer,
                    studentRaw
                );

            const opts =
                optionMap.get(q.id) ??
                [];

            const correctIds =
                isMultiAnswer(
                    q.correct_answer
                )
                    ? q.correct_answer
                        .option_ids
                    : isSingleAnswer(
                        q.correct_answer
                    )
                        ? [
                            q.correct_answer
                                .option_id,
                        ]
                        : [];

            const studentIds =
                isMultiAnswer(
                    studentRaw
                )
                    ? studentRaw.option_ids
                    : isSingleAnswer(
                        studentRaw
                    )
                        ? [
                            studentRaw
                                .option_id,
                        ]
                        : [];

            /*ONLY NEW ADDITION */

            let numericalMeta:
                | {
                    target: number;
                    tolerance: number;
                    studentValue: number | null;
                }
                | undefined;

            if (
                typedSection.answer_mode ===
                "numerical_input" &&
                isNumericalCorrect(
                    q.correct_answer
                )
            ) {
                numericalMeta = {
                    target:
                        q.correct_answer.target,
                    tolerance:
                        q.correct_answer
                            .tolerance,
                    studentValue:
                        isNumericalAnswer(
                            studentRaw
                        )
                            ? studentRaw.value
                            : null,
                };
            }

            return {
                id: q.id,
                questionText:
                    q.question_text,
                explanation:
                    q.explanation,
                marksAwarded:
                    scoring.marks,
                isCorrect:
                    scoring.isCorrect,
                options: opts.map(
                    (o) => ({
                        id: o.id,
                        label:
                            o.option_label,
                        text:
                            o.option_text,
                        isCorrect:
                            correctIds.includes(
                                o.id
                            ),
                        isSelected:
                            studentIds.includes(
                                o.id
                            ),
                    })
                ),

                /* injected only for numerical */
                numericalMeta,
            };
        });

    /* Response */

    return NextResponse.json<QuestionsPageResponse>(
        {
            kind: "ok",
            page,
            totalPages,
            questions:
                questionsPayload,
        }
    );
}
