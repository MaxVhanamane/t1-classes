
"use server"
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { ExploreBatch } from "../types"

// Explore Batches (not already enrolled)
export async function getExploreBatches(): Promise<ExploreBatch[]> {
    const supabase = await createServerSupabaseClient()
    const user = await getCurrentUser()

    const { data: batches, error } = await supabase
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

    if (error || !batches) return []

    const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`batch_id`)
        .eq("user_id", user.id)
        .eq("target_type", "batch")
        .eq("is_active", true)
        .in("status", ["ongoing", "paused"])

    const enrolledBatchIds = new Set(
        enrollments?.map((e) => e.batch_id!).filter(Boolean)
    )

    const batchIds = batches.map((b) => b.id)

    const { data: batchCourses } = await supabase
        .from("batch_courses")
        .select(`batch_id`)
        .in("batch_id", batchIds)

    const countMap = new Map<string, number>()
    batchCourses?.forEach((bc) => {
        countMap.set(bc.batch_id, (countMap.get(bc.batch_id) ?? 0) + 1)
    })

    return batches
        .filter((b) => !enrolledBatchIds.has(b.id))
        .map((b) => ({
            ...b,
            course_count: countMap.get(b.id) ?? 0,
        }))
}
