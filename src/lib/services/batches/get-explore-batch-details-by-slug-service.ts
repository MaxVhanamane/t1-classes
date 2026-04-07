import {
    ExploreBatchDetail,
    ExploreCourseForBatch,
} from "@/src/app/api/explore-batches/[slug]/types";

import { SupabaseClient } from "@supabase/supabase-js";

export async function getExploreBatchDetailBySlugService(
    supabase: SupabaseClient,
    slug: string,

): Promise<ExploreBatchDetail | null> {
    const nowIso = new Date().toISOString();

    /* ----------------------------------------------------------- */
    /* Fetch Batch                                                 */
    /* ----------------------------------------------------------- */

    const { data: batch, error: batchError } = await supabase
        .from("batches")
        .select(`
      id,
      title,
      subtitle,
      slug,
      thumbnail_image,

      category,
      board,

      start_date,
      end_date,

      mode,
      languages,
      location,
      address,

      is_admission_open,

      sale_price,
      list_price,

      learning_outcomes,
      target_audience,

      subjects,
      class_level,
      target_exam,

      description,
      capacity
    `)
        .eq("slug", slug)
        .eq("is_active", true)
        .gte("end_date", nowIso)
        .single();

    if (batchError) {
        throw new Error("Failed to fetch batch");
    }

    if (!batch) return null;

    /* ----------------------------------------------------------- */
    /* Fetch Courses                                               */
    /* ----------------------------------------------------------- */

    const { data: rawBatchCourses, error: coursesError } =
        await supabase
            .from("batch_courses")
            .select(`
        course:course_id!inner (
          id,
          title,
          slug,
          description,
          subtitle,

          learning_outcomes,
          target_audience,

          thumbnail_image,

          category,
          class_level,
          board,
          target_exam,
          subjects,

          list_price,
          sale_price,
          languages,

          is_active
        )
      `)
            .eq("batch_id", batch.id)
            .eq("course.is_active", true)
            .overrideTypes<
                {
                    course: ExploreCourseForBatch;
                }[]
            >();

    if (coursesError) {
        console.error(
            "Error fetching batch courses:",
            coursesError
        );

        throw new Error("Failed to fetch batch courses");
    }

    const courses =
        rawBatchCourses?.map((row) => {
            const course = row.course;

            if (!course) {
                throw new Error(
                    "Invariant violation: course missing"
                );
            }

            return {
                id: course.id,
                title: course.title,
                slug: course.slug,

                description: course.description,
                subtitle: course.subtitle,

                learning_outcomes:
                    course.learning_outcomes,

                target_audience:
                    course.target_audience,

                thumbnail_image:
                    course.thumbnail_image,

                category: course.category,

                class_level:
                    course.class_level,

                board: course.board,

                target_exam:
                    course.target_exam,

                subjects: course.subjects,

                languages: course.languages,

                list_price: Number(
                    course.list_price
                ),

                sale_price: Number(
                    course.sale_price
                ),
            };
        }) ?? [];

    /* ----------------------------------------------------------- */
    /* Return Normalized Object                                    */
    /* ----------------------------------------------------------- */

    return {
        id: batch.id,
        title: batch.title,
        subtitle: batch.subtitle,
        slug: batch.slug,
        thumbnail_image: batch.thumbnail_image,

        category: batch.category,
        board: batch.board,

        start_date: batch.start_date,
        end_date: batch.end_date,

        mode: batch.mode,

        languages: batch.languages,
        location: batch.location,
        address: batch.address,

        is_admission_open:
            batch.is_admission_open,

        sale_price: Number(
            batch.sale_price
        ),

        list_price: Number(
            batch.list_price
        ),

        learning_outcomes:
            batch.learning_outcomes,

        target_audience:
            batch.target_audience,

        subjects: batch.subjects,
        class_level: batch.class_level,
        target_exam: batch.target_exam,

        description: batch.description,
        capacity: batch.capacity,

        courses,
    };
}
