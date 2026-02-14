"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import type { TestBuilderTest } from "../types/test-builder.types";

export async function getTestById(
    testId: string
): Promise<TestBuilderTest> {
    const staff = await getCurrentStaff();
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
        created_by
      `
        )
        .eq("id", testId)
        .single();

    if (error || !data) {
        throw new Error("TEST_NOT_FOUND");
    }

    // ownership check for teachers
    if (staff.role === "teacher" && data.created_by !== staff.id) {
        throw new Error("UNAUTHORIZED");
    }

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        testType: data.test_type,
        isActive: data.is_active,
    };
}
