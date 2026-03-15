import { TestRow } from "../types/test.types";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

const PAGE_SIZE = 20;

export async function getTests(page: number = 1) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);

    if (!user) {
        redirect("/login");
    }

    const supabase = await createServerSupabaseClient();

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from("tests")
        .select(
            `
    id,
    title,
    description,
    test_type,
    created_at,
    is_locked
  `,
            { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);
    if (user.role !== "admin") {
        query = query.eq("created_by", user.userId);
    }

    const { data, error, count } = await query;

    if (error || !data) {
        throw new Error("FAILED_TO_LOAD_TESTS");
    }

    return {
        tests: data as TestRow[],
        totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    };
}
