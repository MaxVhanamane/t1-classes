import "server-only"
import { SupabaseClient } from "@supabase/supabase-js"

import { ExploreCourse } from "@/src/app/api/explore-batches/types"
import { getAllActiveCourses } from "./get-all-active-courses"
import { getUserAccessibleCourseIds } from "./get-user-accessible-course-ids"

export async function getExploreCoursesForUser(
    supabase: SupabaseClient,
    userId?: string
): Promise<ExploreCourse[]> {

    const courses = await getAllActiveCourses()

    if (!userId) {
        return courses
    }

    const excludedCourseIds = await getUserAccessibleCourseIds(
        supabase,
        userId
    )

    return courses.filter(
        (course) => !excludedCourseIds.has(course.id)
    )
}
