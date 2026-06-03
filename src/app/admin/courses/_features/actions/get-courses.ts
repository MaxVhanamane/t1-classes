import "server-only";

import {
    CourseDescription,
} from "../zod/course.schema";

import {
    Board,
    Category,
    TargetExam,
    Subject,
    Language,
} from "../../../batches/_features/zod-schema/schema";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export type CourseRow = {
    id: string;

    title: string;

    slug: string;

    subtitle: string | null;

    thumbnail_image: string | null;

    /* ---------- Category ---------- */

    category: Category;

    /* ---------- Academic ---------- */

    class_level: number | null;

    board: Board | null;

    target_exam: TargetExam | null;

    subjects: Subject[] | null;

    languages: Language[];

    /* ---------- Pricing ---------- */

    list_price: number;

    sale_price: number;

    /* ---------- Status ---------- */

    is_active: boolean;

    /* ---------- Content ---------- */

    description: CourseDescription;

    learning_outcomes: string[] | null;

    target_audience: string[] | null;

    /* ---------- Relations ---------- */

    instructors?: {
        id: string;
        full_name: string;
    }[];

    created_at: string;
};

export async function getCourses(): Promise<CourseRow[]> {
    const supabase =
        await createServerSupabaseClient();

    await requireStaffServerOnly();

    const { data, error } =
        await supabase
            .from("courses")
            .select(`
        id,
        title,
        slug,
        subtitle,
        thumbnail_image,
        category,
        class_level,
        board,
        target_exam,
        subjects,
        list_price,
        sale_price,
        languages,
        is_active,
        description,
        learning_outcomes,
        target_audience,
        created_at,

        course_instructors (
          instructor:users (
            id,
            full_name
          )
        )
      `)
            .order("created_at", {
                ascending: false,
            })
            .overrideTypes<
                (CourseRow & {
                    course_instructors?: {
                        instructor: {
                            id: string;
                            full_name: string;
                        } | null;
                    }[];
                })[],
                {
                    merge: false;
                }
            >();

    if (error) {
        throw new Error(
            error.message,
        );
    }

    if (!data) {
        return [];
    }

    return data.map(
        (course) => {
            const instructors =
                course.course_instructors?.flatMap(
                    (ci) =>
                        ci.instructor
                            ? [
                                ci.instructor,
                            ]
                            : [],
                ) ?? [];

            return {
                ...course,

                instructors,
            };
        },
    );
}
