"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

import {
    CourseDescription,
    courseSchema,
} from "../zod/course.schema";

import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { generateBatchSlug } from "@/src/lib/helper-functions/generate-slug";
import { revalidatePath } from "next/cache";
import {
    Board, Category, TargetExam,
    Subject,
    Language,
} from "../../../batches/_features/zod-schema/schema";

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */


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
/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

/* -------------------------------------------------- */
/* Get Courses                                        */
/* -------------------------------------------------- */
export async function getCourses(): Promise<CourseRow[]> {
    const supabase = await createServerSupabaseClient();

    await getCurrentStaff();

    const { data, error } = await supabase
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
        instructors (
          id,
          full_name
        )
      )
    `)
        .order("created_at", { ascending: false })
        .overrideTypes<
            (CourseRow & {
                course_instructors?: {
                    instructors: {
                        id: string;
                        full_name: string;
                    } | null;
                }[];
            })[],
            { merge: false }
        >();

    if (error) throw new Error(error.message);
    if (!data) return [];

    return data.map((course) => {
        const instructors =
            course.course_instructors?.flatMap((ci) =>
                ci.instructors ? [ci.instructors] : []
            ) ?? [];

        return {
            ...course,
            instructors,
        };
    });
}

/* -------------------------------------------------- */
/* Create Course                                      */
/* -------------------------------------------------- */

export async function createCourse(
    input: unknown
): Promise<string> {
    /* ---------- validate ---------- */
    const parsed = courseSchema.safeParse(input);

    if (!parsed.success) {
        throw new Error(
            parsed.error.issues[0]?.message ?? "Invalid course data"
        );
    }

    const values = parsed.data;


    /* ---------- auth ---------- */
    const staff = await getCurrentStaff();

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
            board: values.category === 'boards' ? values.board : null,

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
            created_by: staff.id,
        })
        .select("id")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const courseId = data.id;

    /* ---------- sync instructors ---------- */
    if (values.instructor_ids?.length) {
        await supabase.from("course_instructors").insert(
            values.instructor_ids.map((id) => ({
                course_id: courseId,
                instructor_id: id,
            }))
        );
    }

    /* ---------- revalidate ---------- */
    revalidatePath("/admin/courses");
    revalidatePath(`/explore/${values.category}/courses`, "layout");
    // revalidatePath(`/explore/${values.category}/courses/details/${slug}`);
    return courseId;
}

/* -------------------------------------------------- */
/* Update Course                                      */
/* -------------------------------------------------- */

export async function updateCourse(
    courseId: string,
    input: unknown
): Promise<string> {
    /* ---------- validate ---------- */
    const parsed = courseSchema.safeParse(input);

    if (!parsed.success) {
        throw new Error(
            parsed.error.issues[0]?.message ?? "Invalid course data"
        );
    }

    const values = parsed.data;
    /* ---------- auth ---------- */
    const staff = await getCurrentStaff();

    const supabase = await createServerSupabaseClient();

    const { data: course } = await supabase
        .from("courses")
        .select("created_by, category")
        .eq("id", courseId)
        .single();

    if (!course) throw new Error("Course not found");

    if (staff.role === "teacher" && course.created_by !== staff.id) {
        throw new Error("Unauthorized");
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
    const { error } = await supabase
        .from("courses")
        .update({
            title: values.title,
            subtitle: values.subtitle ?? null,

            /* ---------- category ---------- */
            category: values.category,
            board: values.category === 'boards' ? values.board : null,

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
            updated_by: staff.id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", courseId);

    if (error) {
        throw new Error(error.message);
    }

    /* ---------- sync instructors ---------- */
    const { data: existing } = await supabase
        .from("course_instructors")
        .select("instructor_id")
        .eq("course_id", courseId);

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
        await supabase.from("course_instructors").insert(
            toInsert.map((id) => ({
                course_id: courseId,
                instructor_id: id,
            }))
        );
    }

    if (toDelete.length) {
        await supabase
            .from("course_instructors")
            .delete()
            .eq("course_id", courseId)
            .in("instructor_id", toDelete);
    }

    /* ---------- revalidate ---------- */
    /* ---------- revalidate ---------- */

    revalidatePath("/admin/courses");

    /* new category */
    revalidatePath(`/explore/${values.category}/courses`, "layout");

    // revalidatePath(
    //     `/explore/${values.category}/courses/details/${slug}`
    // );

    /* old category (only if changed) */
    if (oldCategory && oldCategory !== values.category) {
        revalidatePath(`/explore/${oldCategory}/courses`, "layout");
    }

    return courseId;
}
/* -------------------------------------------------- */
/* Update Thumbnail (KEY ONLY)                        */
/* -------------------------------------------------- */

export async function updateCourseThumbnail(
    courseId: string,
    newKey: string
) {
    const staff =
        await getCurrentStaff();

    const supabase =
        await createServerSupabaseClient();

    const { data } =
        await supabase
            .from("courses")
            .select(
                "created_by, thumbnail_image"
            )
            .eq("id", courseId)
            .single();

    if (!data) {
        throw new Error(
            "Course not found"
        );
    }

    if (
        staff.role === "teacher" &&
        data.created_by !== staff.id
    ) {
        throw new Error(
            "Unauthorized"
        );
    }

    /* ---------- delete old ---------- */

    if (
        data.thumbnail_image &&
        data.thumbnail_image !==
        newKey
    ) {
        await deleteR2Object(
            process.env
                .R2_PUBLIC_BUCKET_NAME!,
            data.thumbnail_image
        ).catch(console.error);
    }

    /* ---------- update ---------- */

    const { error } =
        await supabase
            .from("courses")
            .update({
                thumbnail_image: newKey,
                updated_by: staff.id,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", courseId);

    if (error) {
        throw new Error(error.message);
    }
    revalidatePath("/admin/courses");

}
