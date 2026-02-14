import { ExploreCourse } from "@/src/app/api/explore-batches/types"
import { SupabaseClient } from "@supabase/supabase-js"


export async function getExploreCoursesService(
    supabase: SupabaseClient,
    userId?: string
): Promise<ExploreCourse[]> {
    /**
     * 1 Fetch active courses
     */
    const { data: courses, error: coursesError } =
        await supabase
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

    if (coursesError) {
        console.error("Error fetching courses:", coursesError)
        throw new Error("Failed to fetch courses")
    }

    if (!courses) return []

    /**
     * 2 Fetch user enrollments (optional)
     */
    const directlyEnrolledCourseIds = new Set<string>()

    if (userId) {
        const {
            data: enrollments,
            error: enrollmentsError,
        } = await supabase
            .from("enrollments")
            .select(`target_type, course_id`)
            .eq("user_id", userId)
            .eq("is_active", true)
            .in("status", ["ongoing", "paused"])

        if (enrollmentsError) {
            console.error(
                "Error fetching enrollments:",
                enrollmentsError
            )
            throw new Error("Failed to fetch enrollments")
        }

        enrollments?.forEach((e) => {
            if (e.target_type === "course" && e.course_id) {
                directlyEnrolledCourseIds.add(e.course_id)
            }
        })
    }

    /**
     * 3 Filter enrolled courses
     */
    return courses.filter(
        (course) =>
            !directlyEnrolledCourseIds.has(course.id)
    )
}
