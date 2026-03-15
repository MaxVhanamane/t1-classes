import { ExploreBatch } from "@/src/app/api/explore-batches/types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getExploreBatchesService(
    supabase: SupabaseClient,
    userId?: string
): Promise<ExploreBatch[]> {
    /* -------------------------------------------------------------------------- */
    /* 1. Fetch active + upcoming/ongoing batches                                 */
    /* -------------------------------------------------------------------------- */

    const { data: batches, error: batchesError } = await supabase
        .from("batches")
        .select(`
      id,
      title,
      slug,
      subtitle,
      thumbnail_image,
      sale_price,
      list_price,
      mode,
      is_admission_open,
      start_date,
      end_date,
      languages,
      location,
      subjects,
      class_level,
      target_exam
    `)
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });

    if (batchesError) {
        console.error("Error fetching batches:", batchesError);
        throw new Error("Failed to fetch batches");
    }

    if (!batches || batches.length === 0) return [];

    /* -------------------------------------------------------------------------- */
    /* 2. Fetch user enrollments (to exclude)                                     */
    /* -------------------------------------------------------------------------- */

    let enrolledBatchIds = new Set<string>();

    if (userId) {
        const { data: enrollments, error: enrollmentsError } =
            await supabase
                .from("enrollments")
                .select(`batch_id`)
                .eq("user_id", userId)
                .eq("target_type", "batch")
                .eq("is_active", true)
                .in("status", ["ongoing", "paused"]);

        if (enrollmentsError) {
            console.error("Error fetching enrollments:", enrollmentsError);
            throw new Error("Failed to fetch enrollments");
        }

        enrolledBatchIds = new Set(
            enrollments
                ?.map((e) => e.batch_id!)
                .filter(Boolean)
        );
    }

    /* -------------------------------------------------------------------------- */
    /* 3. Fetch ACTIVE course counts per batch                                    */
    /* -------------------------------------------------------------------------- */

    const batchIds = batches.map((b) => b.id);

    const { data: batchCourses, error: coursesError } =
        await supabase
            .from("batch_courses")
            .select(`
        batch_id,
        courses!inner (
          id,
          is_active
        )
      `)
            .in("batch_id", batchIds)
            .eq("courses.is_active", true);

    if (coursesError) {
        console.error("Error fetching batch courses:", coursesError);
        throw new Error("Failed to fetch batch courses");
    }

    /* -------------------------------------------------------------------------- */
    /* 4. Build course count map                                                  */
    /* -------------------------------------------------------------------------- */

    const countMap = new Map<string, number>();

    batchCourses?.forEach((bc) => {
        countMap.set(
            bc.batch_id,
            (countMap.get(bc.batch_id) ?? 0) + 1
        );
    });

    /* -------------------------------------------------------------------------- */
    /* 5. Normalize + exclude enrolled                                            */
    /* -------------------------------------------------------------------------- */

    return batches
        .filter((b) => !enrolledBatchIds.has(b.id))
        .map((b) => ({
            ...b,
            course_count: countMap.get(b.id) ?? 0,
        }));
}
