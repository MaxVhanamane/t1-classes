import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function getPracticeSetsByTopic(topicId: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("practice_sets")
        .select("id, title, description, is_published, created_at,is_free_preview")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}
