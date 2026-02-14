import { ExploreBatch } from "@/src/app/api/explore-batches/types"
import { SupabaseClient } from "@supabase/supabase-js"

export async function getExploreBatchesService(
    supabase: SupabaseClient,
    userId?: string
): Promise<ExploreBatch[]> {
    /**
     * Fetch active batches
     */
    const { data: batches, error: batchesError } = await supabase
        .from("batches")
        .select(`
      id,
      name,
      description,
      mode,
      status,
      start_date,
      duration,
      price,
      admission_open
    `)
        .eq("is_active", true)
        .in("status", ["upcoming", "ongoing"])

    if (batchesError) {
        console.error("Error fetching batches:", batchesError)
        throw new Error("Failed to fetch batches")
    }

    if (!batches) return []

    /**
     * Fetch user enrollments (optional)
     */
    let enrolledBatchIds = new Set<string>()

    if (userId) {
        const { data: enrollments, error: enrollmentsError } =
            await supabase
                .from("enrollments")
                .select(`batch_id`)
                .eq("user_id", userId)
                .eq("target_type", "batch")
                .eq("is_active", true)
                .in("status", ["ongoing", "paused"])

        if (enrollmentsError) {
            console.error(
                "Error fetching enrollments:",
                enrollmentsError
            )
            throw new Error("Failed to fetch enrollments")
        }

        enrolledBatchIds = new Set(
            enrollments?.map((e) => e.batch_id!).filter(Boolean)
        )
    }

    /**
     * Fetch batch course counts
     */
    const batchIds = batches.map((b) => b.id)

    const { data: batchCourses, error: coursesError } =
        await supabase
            .from("batch_courses")
            .select(`batch_id`)
            .in("batch_id", batchIds)

    if (coursesError) {
        console.error(
            "Error fetching batch courses:",
            coursesError
        )
        throw new Error("Failed to fetch batch courses")
    }

    const countMap = new Map<string, number>()

    batchCourses?.forEach((bc) => {
        countMap.set(
            bc.batch_id,
            (countMap.get(bc.batch_id) ?? 0) + 1
        )
    })

    /**
     * Normalize result
     */
    return batches
        .filter((b) => !enrolledBatchIds.has(b.id))
        .map((b) => ({
            ...b,
            course_count: countMap.get(b.id) ?? 0,
        }))
}
