"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { createTestSchema } from "../zod/create-test.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function createTest(
    input: unknown
): Promise<ServerActionResponse<string>> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = createTestSchema.safeParse(input);
        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid test data",
            };
        }


        const supabase = await createServerSupabaseClient();

        /**
         * 3. Insert test
         */
        const { data, error } = await supabase
            .from("tests")
            .insert({
                title: parsed.data.title,
                description: parsed.data.description ?? null,
                test_type: parsed.data.testType,
                created_by: staff.userId,
            })
            .select("id")
            .single();

        if (error || !data) {
            console.error("[CREATE_TEST_ERROR]", error);
            return {
                error: "Failed to create test. Please try again.",
            };
        }

        /**
         * 4. Return created test ID
         */
        return { data: data.id };
    } catch (err) {
        console.error("[CREATE_TEST_FATAL]", err);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
