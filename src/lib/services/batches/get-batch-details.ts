"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser"
import type {
    BatchDetailsResponse,
    BatchCourse,
} from "@/src/types/batches.types"


export async function getBatchDetails(
    batchId: string
): Promise<BatchDetailsResponse> {
    const supabase = await createServerSupabaseClient()
    const user = await getCurrentUser()

    const now = new Date().toISOString()

    /* -----------------------------------------------------------
     * 1. Validate batch enrollment + access window
     * --------------------------------------------------------- */
    const { count, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("target_type", "batch")
        .eq("batch_id", batchId)
        .in("status", ["ongoing", "paused"])
        .lte("access_starts_at", now)
        .or(`access_ends_at.is.null,access_ends_at.gte.${now}`)

    if (enrollmentError || (count ?? 0) === 0) {
        throw new Error("BATCH_ACCESS_DENIED")
    }

    /* -----------------------------------------------------------
     * 2. Fetch batch + courses (single query)
     * --------------------------------------------------------- */
    const { data, error } = await supabase
        .from("batches")
        .select(
            `
        id,
        name,
        mode,
        status,
        description,
        start_date,
        end_date,
        batch_courses (
          course:courses (
            id,
            title,
            slug,
            description,
            thumbnail_image,
            course_type,
            target_exam,
            class_level,
            subjects
          )
        )
      `
        )
        .eq("id", batchId)
        .eq("is_active", true)
        .single()

    if (error || !data) {
        throw new Error("BATCH_NOT_FOUND")
    }

    /* -----------------------------------------------------------
     * 3. Normalize courses (DB → domain boundary)
     * --------------------------------------------------------- */
    const courses: BatchCourse[] =
        data.batch_courses?.map((bc) => {
            const course = (bc.course as unknown as {
                id: string
                title: string
                slug: string
                description: string | null
                thumbnail_image: string | null
                course_type: BatchCourse["courseType"]
                target_exam: string | null
                class_level: number | null
                subjects: string[] | null
            })

            return {
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.description,
                thumbnailImage: course.thumbnail_image,
                courseType: course.course_type,
                targetExam: course.target_exam,
                classLevel: course.class_level,
                subjects: course.subjects,
            }
        }) ?? []


    /* -----------------------------------------------------------
     * 4. Return domain-shaped response
     * --------------------------------------------------------- */
    return {
        batch: {
            id: data.id,
            name: data.name,
            mode: data.mode,
            status: data.status,
            description: data.description,
            startDate: data.start_date,
            endDate: data.end_date,
        },
        courses,
    }
}
