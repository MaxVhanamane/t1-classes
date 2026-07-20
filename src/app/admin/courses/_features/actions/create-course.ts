"use server";

import { updateTag } from "next/cache";
import { courseSchema } from "../zod/course.schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { generateBatchSlug } from "@/src/lib/helper-functions/generate-slug";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function createCourse(
    input: unknown
): Promise<ServerActionResponse<string>> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /* ---------- validate ---------- */
        const parsed = courseSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid course data",
            };
        }

        const values = parsed.data;



        const supabase = await createServerSupabaseClient();

        /* ---------- slug ---------- */
        const slug = generateBatchSlug(values.title);

        /* ---------- description ---------- */
        const description =
            values.description &&
                Object.keys(values.description).length
                ? values.description
                : null;

        /* ---------- transforms ---------- */
        const subjects =
            values.subjects?.map((s) => s.value) ?? null;

        const learningOutcomes =
            values.learning_outcomes?.map((o) => o.value) ?? null;

        const targetAudience =
            values.target_audience?.map((a) => a.value) ?? null;

        const languages = values.languages;

        /* ---------- insert course ---------- */
        const { data, error } = await supabase
            .from("courses")
            .insert({
                title: values.title,
                subtitle: values.subtitle ?? null,
                slug,
                thumbnail_image: values.thumbnail_image ?? null,

                /* ---------- category ---------- */
                category: values.category,
                board:
                    values.category === "boards" ? values.board : null,

                /* ---------- academic ---------- */
                class_level: values.class_level ?? null,
                target_exam: values.target_exam ?? null,
                subjects,

                /* ---------- pricing ---------- */
                list_price: values.list_price,
                sale_price: values.sale_price,

                /* ---------- delivery ---------- */
                languages,
                currency: "INR",

                /* ---------- status ---------- */
                is_active: values.is_active,

                /* ---------- content ---------- */
                description,
                learning_outcomes: learningOutcomes,
                target_audience: targetAudience,

                /* ---------- meta ---------- */
                created_by: staff.userId,
            })
            .select("id")
            .single();

        if (error || !data) {
            console.error("[CREATE_COURSE_ERROR]", error);
            return {
                error: "Failed to create course. Please try again.",
            };
        }

        const courseId = data.id;

        /* ---------- sync instructors ---------- */
        if (values.instructor_ids?.length) {
            const { error: instructorError } = await supabase
                .from("course_instructors")
                .insert(
                    values.instructor_ids.map((id) => ({
                        course_id: courseId,
                        instructor_id: id,
                    }))
                );

            if (instructorError) {
                console.error(
                    "[CREATE_COURSE_INSTRUCTORS_ERROR]",
                    instructorError
                );
                return {
                    error:
                        "Course created, but assigning instructors failed.",
                };
            }
        }

        /* ---------- revalidate ---------- */

        updateTag(`course-list-${values.category}`);

        return { data: courseId };
    } catch (error) {
        console.error("[CREATE_COURSE_FATAL]", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
