import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";
import { ExploreCourse } from "@/src/app/api/explore-batches/types";

export async function getExploreCoursesForUser(
    supabase: SupabaseClient,
    limit: number = 6,
): Promise<ExploreCourse[]> {
    const { data, error } = await supabase.rpc("get_explore_courses_private", {
        p_limit: limit,
    });

    if (error) {
        console.error("Error fetching explore courses:", error);
        throw new Error("Failed to fetch explore courses");
    }

    return (data ?? []) as ExploreCourse[];
}
