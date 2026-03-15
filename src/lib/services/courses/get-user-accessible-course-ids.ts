import "server-only"
import { SupabaseClient } from "@supabase/supabase-js"

type BatchCourseRow = {
    batch_id: string
    course: { id: string; is_active: boolean } | null
}

export async function getUserAccessibleCourseIds(
    supabase: SupabaseClient,
    userId: string
): Promise<Set<string>> {

    const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
      target_type,
      course_id,
      batch_id
    `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .in("status", ["ongoing", "paused"])

    if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError)
        throw new Error("Failed to fetch enrollments")
    }

    const excludedCourseIds = new Set<string>()
    const enrolledBatchIds: string[] = []

    enrollments?.forEach((e) => {

        if (e.target_type === "course" && e.course_id) {
            excludedCourseIds.add(e.course_id)
        }

        if (e.target_type === "batch" && e.batch_id) {
            enrolledBatchIds.push(e.batch_id)
        }

    })

    if (enrolledBatchIds.length === 0) {
        return excludedCourseIds
    }

    const { data: batchCourses, error: batchCoursesError } = await supabase
        .from("batch_courses")
        .select(`
      batch_id,
      course:course_id ( id, is_active )
    `)
        .in("batch_id", enrolledBatchIds)

    if (batchCoursesError) {
        console.error("Error fetching batch courses:", batchCoursesError)
        throw new Error("Failed to fetch batch courses")
    }

    const rows = batchCourses as unknown as BatchCourseRow[]

    rows.forEach((row) => {
        if (row.course?.is_active) {
            excludedCourseIds.add(row.course.id)
        }
    })

    return excludedCourseIds
}
