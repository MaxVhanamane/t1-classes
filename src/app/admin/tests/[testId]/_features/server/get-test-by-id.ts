import "server-only"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import type { TestBuilderTest } from "../types/test-builder.types";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function getTestById(
    testId: string
): Promise<TestBuilderTest> {
    const user = await getAuthIfHasRole(["admin", "teacher"]); // admin / teacher only

    if (!user) {
        redirect("/login")
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("tests")
        .select(
            `
        id,
        title,
        description,
        test_type,
        is_active,
        created_by,
        is_locked
      `
        )
        .eq("id", testId)
        .single();

    if (error || !data) {
        throw new Error("TEST_NOT_FOUND");
    }

    // ownership check for teachers
    if (user.role === "teacher" && data.created_by !== user.userId) {
        throw new Error("UNAUTHORIZED");
    }

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        test_type: data.test_type,
        is_active: data.is_active,
        is_locked: data.is_locked,
    };
}
