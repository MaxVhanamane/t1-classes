"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { courseSchema } from "../zod/course.schema";
import { updateTag } from "next/cache";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function updateCourse(
    courseId: string,
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

        /* ---------- fetch existing course ---------- */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by, category, slug")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        if (
            staff.role === "teacher" &&
            course.created_by !== staff.userId
        ) {
            return { error: "Unauthorized" };
        }

        const oldCategory = course.category;

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

        /* ---------- update course ---------- */
        const { error: updateError } = await supabase
            .from("courses")
            .update({
                title: values.title,
                subtitle: values.subtitle ?? null,

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

                /* ---------- status ---------- */
                is_active: values.is_active,

                /* ---------- content ---------- */
                description,
                learning_outcomes: learningOutcomes,
                target_audience: targetAudience,

                /* ---------- meta ---------- */
                updated_by: staff.userId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", courseId);

        if (updateError) {
            console.error("[UPDATE_COURSE_ERROR]", updateError);
            return {
                error: "Failed to update course. Please try again.",
            };
        }

        /* ---------- sync instructors ---------- */
        const { data: existing, error: existingError } =
            await supabase
                .from("course_instructors")
                .select("instructor_id")
                .eq("course_id", courseId);

        if (existingError) {
            console.error(
                "[UPDATE_COURSE_FETCH_INSTRUCTORS_ERROR]",
                existingError
            );
            return {
                error:
                    "Course updated, but failed to sync instructors.",
            };
        }

        const existingIds =
            existing?.map((i) => i.instructor_id) ?? [];

        const newIds = values.instructor_ids ?? [];

        const toInsert = newIds.filter(
            (id) => !existingIds.includes(id)
        );

        const toDelete = existingIds.filter(
            (id) => !newIds.includes(id)
        );

        if (toInsert.length) {
            const { error: insertError } = await supabase
                .from("course_instructors")
                .insert(
                    toInsert.map((id) => ({
                        course_id: courseId,
                        instructor_id: id,
                    }))
                );

            if (insertError) {
                console.error(
                    "[UPDATE_COURSE_INSERT_INSTRUCTORS_ERROR]",
                    insertError
                );
                return {
                    error:
                        "Course updated, but assigning instructors failed.",
                };
            }
        }

        if (toDelete.length) {
            const { error: deleteError } = await supabase
                .from("course_instructors")
                .delete()
                .eq("course_id", courseId)
                .in("instructor_id", toDelete);

            if (deleteError) {
                console.error(
                    "[UPDATE_COURSE_DELETE_INSTRUCTORS_ERROR]",
                    deleteError
                );
                return {
                    error:
                        "Course updated, but removing instructors failed.",
                };
            }
        }

        /* ---------- revalidate ---------- */


        updateTag(`course-detail-${course.slug}`);
        updateTag(`course-list-${values.category}`);

        if (
            oldCategory &&
            oldCategory !== values.category
        ) {
            updateTag(`course-list-${oldCategory}`);
        }

        return { data: courseId };
    } catch (error) {
        console.error("[UPDATE_COURSE_FATAL]", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
