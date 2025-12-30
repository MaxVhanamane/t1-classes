"use server";

import { UserSearchResult } from "@/src/types/user";
import { createServerSupabaseClient } from "../supabase/supabase-server";


export async function searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("users")
        .select("id, full_name, phone")
        .eq("role", "student")
        .eq("status", "active")
        .or(
            `full_name.ilike.%${query}%,phone.ilike.%${query}%`
        )
        .limit(10);


    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}
