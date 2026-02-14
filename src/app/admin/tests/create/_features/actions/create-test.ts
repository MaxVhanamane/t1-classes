"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { createTestSchema } from "../zod/create-test.schema";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

export async function createTest(input: unknown) {
    const parsed = createTestSchema.parse(input);

    const staff = await getCurrentStaff();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("tests")
        .insert({
            title: parsed.title,
            description: parsed.description ?? null,
            test_type: parsed.testType,
            created_by: staff.id,
        })
        .select("id")
        .single();

    if (error) {
        throw new Error("Failed to create test. Please try again.");
    }

    return {
        testId: data.id,
    };
}
