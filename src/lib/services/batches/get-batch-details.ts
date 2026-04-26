"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import type {
    BatchDetailsResponse,
    BatchCourse,
} from "@/src/types/batches.types";

import { getAuth } from "../../auth/get-auth";

export async function getBatchDetails(
    batchId: string,
): Promise<BatchDetailsResponse> {
    const supabase =
        await createServerSupabaseClient();

    const user =
        await getAuth();

    const now =
        new Date().toISOString();

    /* ----------------------------------------------------------- */
    /* 1. Validate batch enrollment + access window                */
    /* ----------------------------------------------------------- */

    const {
        count,
        error:
        enrollmentError,
    } = await supabase
        .from(
            "enrollments",
        )
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq(
            "user_id",
            user?.userId,
        )
        .eq(
            "target_type",
            "batch",
        )
        .eq(
            "batch_id",
            batchId,
        )
        .eq(
            "is_active",
            true,
        )
        .lte(
            "access_starts_at",
            now,
        )
        .or(
            `access_ends_at.is.null,access_ends_at.gte.${now}`,
        );

    if (
        enrollmentError ||
        (count ?? 0) === 0
    ) {
        throw new Error(
            "BATCH_ACCESS_DENIED",
        );
    }

    /* ----------------------------------------------------------- */
    /* 2. Fetch batch + active courses                            */
    /* ----------------------------------------------------------- */

    const {
        data,
        error,
    } = await supabase
        .from("batches")
        .select(
            `
      id,
      title,
      subtitle,

      category,
      board,
      target_exam,
      class_level,
      subjects,

      mode,
      is_active,
      is_admission_open,

      description,

      start_date,
      end_date,

      batch_courses (
        course:courses!inner (
          id,
          title,
          subtitle,
          slug,
          thumbnail_image,

          category,
          target_exam,
          class_level,
          subjects,

          is_active
        )
      )
    `,
        )
        .eq("id", batchId)
        .eq(
            "is_active",
            true,
        )
        .eq(
            "batch_courses.course.is_active",
            true,
        )
        .single();

    if (
        error ||
        !data
    ) {
        throw new Error(
            "BATCH_NOT_FOUND",
        );
    }

    /* ----------------------------------------------------------- */
    /* 3. Normalize courses                                        */
    /* ----------------------------------------------------------- */

    const courses: BatchCourse[] =
        data.batch_courses?.map(
            (bc) => {
                const course =
                    Array.isArray(
                        bc.course,
                    )
                        ? bc.course[0]
                        : bc.course;

                return {
                    id: course.id,
                    title:
                        course.title,
                    subtitle:
                        course.subtitle,
                    slug:
                        course.slug,
                    thumbnail_image:
                        course.thumbnail_image,

                    category:
                        course.category,

                    target_exam:
                        course.target_exam,

                    class_level:
                        course.class_level,

                    subjects:
                        course.subjects,
                };
            },
        ) ?? [];

    /* ----------------------------------------------------------- */
    /* 4. Return response                                          */
    /* ----------------------------------------------------------- */

    return {
        batch: {
            id: data.id,
            title:
                data.title,
            subtitle:
                data.subtitle,

            category:
                data.category,
            board:
                data.board,

            target_exam:
                data.target_exam,

            class_level:
                data.class_level,

            subjects:
                data.subjects,

            mode:
                data.mode,

            is_active:
                data.is_active,

            is_admission_open:
                data.is_admission_open,

            description:
                data.description,

            start_date:
                data.start_date,

            end_date:
                data.end_date,
        },

        courses,
    };
}
