"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { BatchRow } from "../types/audience.types";

export async function getBatches(): Promise<BatchRow[]> {
    await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("batches")
        .select("id, name, is_active")
        .eq("is_active", true)
        .order("name");

    if (error) {
        console.error("[GET_BATCHES_ERROR]", error);
        throw new Error("FAILED_TO_FETCH_BATCHES");
    }

    return data as BatchRow[];
}
