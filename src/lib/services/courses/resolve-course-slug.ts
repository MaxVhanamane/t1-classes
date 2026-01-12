"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function resolveCourseSlug(slug: string): Promise<{
    id: string;
    slug: string;
}> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("courses")
        .select("id, slug")
        .eq("slug", slug)
        .single();


    if (error || !data) {
        throw new Error("Course not found");
    }

    return data;
}
