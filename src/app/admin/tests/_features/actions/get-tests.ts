import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { TestRow } from "../types/test.types";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function getTests(): Promise<TestRow[]> {
    const staff = await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from("tests")
        .select("*")
        .order("created_at", { ascending: false });

    if (staff.role !== "admin") {
        query = query.eq("created_by", staff.id);
    }

    const { data, error } = await query;

    if (error || !data) {
        throw new Error("FAILED_TO_LOAD_TESTS");
    }

    return data as TestRow[];
}
