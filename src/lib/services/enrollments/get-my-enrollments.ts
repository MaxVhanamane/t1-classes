import "server-only"
import type {
    MyEnrollment,
    CourseEnrollment,
    BatchEnrollment,
    RawEnrollmentRow,
} from "@/src/app/api/my-enrollments/types"
import { SupabaseClient } from "@supabase/supabase-js"

export async function getMyEnrollmentsService(
    supabase: SupabaseClient,
    userId: string
): Promise<MyEnrollment[]> {

    const nowIso = new Date().toISOString()

    const { data, error } = await supabase
        .from("enrollments")
        .select(`
      id,
      target_type,
      status,
      access_starts_at,
      access_ends_at,
      course:course_id (
        id,
        title,
        slug,
        course_type,
        is_active
      ),
      batch:batch_id (
        id,
        title,
        subtitle,
        slug,
        mode,
        start_date,
        end_date,
        is_active
      )
    `)
        .eq("user_id", userId)
        .eq("status", "ongoing")
        .lte("access_starts_at", nowIso)
        .or(`access_ends_at.is.null,access_ends_at.gte.${nowIso}`)
        .order("created_at", { ascending: false })



    if (error) {
        console.error("Error fetching enrollments:", error)
        throw new Error("Failed to fetch enrollments")
    }

    if (!data) return []

    const enrollments = (data as unknown as RawEnrollmentRow[]).filter((e) => {
        if (e.target_type === "course") return e.course?.is_active
        if (e.target_type === "batch") return e.batch?.is_active
        return false
    })

    const result: MyEnrollment[] = enrollments.map((e) => {

        if (e.target_type === "course") {
            const course = e.course!

            const courseEnrollment: CourseEnrollment = {
                enrollmentId: e.id,
                targetType: "course",
                status: e.status,
                accessStartsAt: e.access_starts_at,
                accessEndsAt: e.access_ends_at,
                course: {
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    courseType: course.course_type,
                },
            }

            return courseEnrollment
        }

        const batch = e.batch!

        const batchEnrollment: BatchEnrollment = {
            enrollmentId: e.id,
            targetType: "batch",
            status: e.status,
            accessStartsAt: e.access_starts_at,
            accessEndsAt: e.access_ends_at,
            batch: {
                id: batch.id,
                title: batch.title,
                subtitle: batch.subtitle,
                slug: batch.slug,
                mode: batch.mode,
                start_date: batch.start_date,
                end_date: batch.end_date,
            },
        }

        return batchEnrollment
    })

    return result
}
