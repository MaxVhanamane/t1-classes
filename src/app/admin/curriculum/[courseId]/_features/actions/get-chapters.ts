"use server";

import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ChapterRow } from "../types/course-structure.types";


export async function getChapters(courseId: string): Promise<ChapterRow[]> {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
        .from("course_structure")
        .select("id, title, sort_order,is_published")
        .eq("course_id", courseId)
        .is("parent_id", null)
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}
