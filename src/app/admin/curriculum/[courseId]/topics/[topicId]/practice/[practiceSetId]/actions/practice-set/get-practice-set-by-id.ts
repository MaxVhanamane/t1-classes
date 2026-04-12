"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function getPracticeSetById(practiceSetId: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("practice_sets")
        .select("id, title, description, topic_id, is_published")
        .eq("id", practiceSetId)
        .single();

    if (error || !data) {
        throw new Error("Practice set not found");
    }

    return data;
}
