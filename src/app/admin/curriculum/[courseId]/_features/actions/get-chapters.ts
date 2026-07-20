import "server-only"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ChapterRow } from "../types/course-structure.types";
import { getAuthClaims } from "@/src/lib/auth/claims/get-auth-claims";


export async function getChapters(courseId: string): Promise<ChapterRow[]> {
    const supabase = await createServerSupabaseClient();
    const user = await getAuthClaims();

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
