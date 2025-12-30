
"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { CourseUnit } from "../types/course-unit.types";

export async function getUnitsByTopic(
    topicId: string
): Promise<CourseUnit[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("course_units")
        .select(`
      id,
      title,
      description,
      is_published,
      unit_type,
      content_url,
      file_path,
      duration_minutes,
      is_free_preview,
      sort_order,
      video_provider
    `)
        .eq("structure_id", topicId)
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    /**
     * IMPORTANT:
     * Supabase returns nullable fields for all rows.
     * We trust DB constraints + unit_type to ensure correctness.
     */
    return (data ?? []) as CourseUnit[];
}
