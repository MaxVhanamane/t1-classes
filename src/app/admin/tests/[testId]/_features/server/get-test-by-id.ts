import "server-only"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import type { TestBuilderTest } from "../types/test-builder.types";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function getTestById(
    testId: string
): Promise<TestBuilderTest> {
    const staff = await requireStaffServerOnly();

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
    if (staff.role === "teacher" && data.created_by !== staff.userId) {
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
