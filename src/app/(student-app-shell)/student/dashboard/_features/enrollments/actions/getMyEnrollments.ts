"use server"

import type {
    MyEnrollment,
    CourseEnrollment,
    BatchEnrollment,
    RawEnrollmentRow,
    RawBatchCourseRow,
} from "../types"
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"



export async function getMyEnrollments(): Promise<MyEnrollment[]> {
    const supabase = await createServerSupabaseClient()
    const user = await getCurrentUser()

    if (!user) {
        return []
    }

    const nowIso = new Date().toISOString()

    const { data, error } = await supabase
        .from("enrollments")
        .select(
            `
      id,
      target_type,
      status,
      access_starts_at,
      access_ends_at,
      course:course_id (
        id,
        title,
        slug,
        thumbnail_image,
        course_type
      ),
      batch:batch_id (
        id,
        name,
        mode,
        schedule,
        status
      )
    `
        )
        .eq("user_id", user.id)
        .eq("status", "ongoing")
        .lte("access_starts_at", nowIso)
        .or(`access_ends_at.is.null,access_ends_at.gte.${nowIso}`)
        .order("created_at", { ascending: false })
    if (error || !data) {
        return []
    }

    const enrollments = data as unknown as RawEnrollmentRow[]


    /**
     * Collect batch IDs
     */
    const batchIds = enrollments
        .filter((e) => e.target_type === "batch")
        .map((e) => e.batch?.id)
        .filter((id): id is string => Boolean(id))

    /**
     * Fetch batch → courses mapping
     */
    const batchCoursesMap = new Map<string, { id: string; title: string }[]>()

    if (batchIds.length > 0) {

        const { data: rawBatchCourses } = await supabase
            .from("batch_courses")
            .select(
                `
        batch_id,
        course:course_id (
          id,
          title
        )
      `
            )
            .in("batch_id", batchIds)

        const batchCourses = rawBatchCourses as unknown as RawBatchCourseRow[]



        batchCourses?.forEach((row) => {
            const course = row.course
            if (!course) {
                throw new Error(
                    `Invariant violation: batch_course ${row.batch_id} has no course`
                )
            }

            const list = batchCoursesMap.get(row.batch_id) ?? []
            list.push({
                id: course.id,
                title: course.title,
            })
            batchCoursesMap.set(row.batch_id, list)
        })
    }

    /**
     * Normalize into domain types
     */
    const result: MyEnrollment[] = enrollments.map((e) => {
        if (e.target_type === "course") {
            const course = e.course
            if (!course) {
                throw new Error(
                    `Invariant violation: course enrollment ${e.id} has no course`
                )
            }

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
                    thumbnailImage: course.thumbnail_image,
                    courseType: course.course_type,
                },
            }

            return courseEnrollment
        }

        const batch = e.batch
        if (!batch) {
            throw new Error(
                `Invariant violation: batch enrollment ${e.id} has no batch`
            )
        }

        const batchEnrollment: BatchEnrollment = {
            enrollmentId: e.id,
            targetType: "batch",
            status: e.status,
            accessStartsAt: e.access_starts_at,
            accessEndsAt: e.access_ends_at,
            batch: {
                id: batch.id,
                name: batch.name,
                mode: batch.mode,
                schedule: batch.schedule,
                status: batch.status,
                courses: batchCoursesMap.get(batch.id) ?? [],
            },
        }

        return batchEnrollment
    })

    return result
}
