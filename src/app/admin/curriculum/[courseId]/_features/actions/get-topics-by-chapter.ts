"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { TopicWithCount } from "../types/course-structure.types";


export async function getTopicsByChapter(chapterId: string): Promise<TopicWithCount[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("course_structure")
        .select(
            `
      id,
      title,
      is_published,
      sort_order,
      course_units:course_units(count)
    `
        )
        .eq("parent_id", chapterId)
        .eq("structure_type", "topic")
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (
        data?.map((topic) => ({
            id: topic.id,
            title: topic.title,
            is_published: topic.is_published,
            sort_order: topic.sort_order,
            contentCount: topic.course_units?.[0]?.count ?? 0,
        })) ?? []
    );
}
