import "server-only"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { ExploreCourse } from "@/src/app/api/explore-batches/types"

export async function getAllActiveCourses(): Promise<ExploreCourse[]> {

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("courses")
        .select(`
      id,
      title,
      slug,
      description,
      subtitle,
      learning_outcomes,
      target_audience,
      thumbnail_image,
      course_type,
      class_level,
      board,
      target_exam,
      subjects,
      list_price,
      sale_price,
      languages
    `)
        .eq("is_active", true)

    if (error) {
        console.error("Error fetching active courses:", error)
        throw new Error("Failed to fetch courses")
    }

    return data ?? []
}
