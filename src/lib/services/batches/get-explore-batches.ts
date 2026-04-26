// import { ExploreBatch } from "@/src/app/api/explore-batches/types";
// import { SupabaseClient } from "@supabase/supabase-js";

// export async function getExploreBatchesService(
//     supabase: SupabaseClient
// ): Promise<ExploreBatch[]> {
//     const { data, error } = await supabase.rpc(
//         "get_explore_batches_private",
//         { p_limit: 3 }
//     );

//     if (error) {
//         console.error(error);
//         throw new Error("Failed to fetch batches");
//     }

//     return (data ?? []) as ExploreBatch[];
// }
