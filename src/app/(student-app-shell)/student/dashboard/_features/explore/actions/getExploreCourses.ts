"use server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import type { ExploreCourse } from "../types"
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser"

//  Explore Courses (not already enrolled)
export async function getExploreCourses(): Promise<ExploreCourse[]> {
    const supabase = await createServerSupabaseClient()
    const user = await getCurrentUser()

    // 1. Fetch active courses
    const { data: courses, error } = await supabase
        .from("courses")
        .select(`
      id,
      title,
      slug,
      description,
      thumbnail_image,
      course_type,
      class_level,
      board,
      target_exam,
      subjects,
      price
    `)
        .eq("is_active", true)

    if (error || !courses) return []

    // 2. Fetch active enrollments
    const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`target_type, course_id`)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .in("status", ["ongoing", "paused"])

    // 3. Only exclude directly enrolled courses
    const directlyEnrolledCourseIds = new Set<string>()

    enrollments?.forEach((e) => {
        if (e.target_type === "course" && e.course_id) {
            directlyEnrolledCourseIds.add(e.course_id)
        }
    })

    // 4. Filter
    return courses.filter(
        (course) => !directlyEnrolledCourseIds.has(course.id)
    )
}


