"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ScheduleTestInput } from "../zod/schedule-test.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createTestDistribution(
    input: ScheduleTestInput
): Promise<ServerActionResponse<string>> {
    const staff = await requireStaffServerOnly();

    try {
        const supabase = await createServerSupabaseClient();

        if (!input.batch_id) {
            return { error: "Batch is required" };
        }

        const { data, error } = await supabase.rpc(
            "rpc_create_test_distribution",
            {
                p_test_id: input.test_id,
                p_batch_id: input.batch_id,
                p_starts_at: input.starts_at,
                p_ends_at: input.ends_at,
                p_duration_minutes: input.duration_minutes,
                p_created_by: staff.userId,
            }
        );

        if (error) {
            return { error: normalizeRpcError(error.message) };
        }

        return { data };
    } catch (err) {
        console.error("[CREATE_TEST_DISTRIBUTION_ERROR]", err);

        return {
            error: "Failed to create test distribution",
        };
    }
}

function normalizeRpcError(message: string): string {
    console.log("mmmmmmmmmm",message)
    if (!message) {
        return "Failed to create test distribution";
    }

    if (message.includes("TEST_NOT_FOUND")) {
        return "The selected test was not found.";
    }

    if (message.includes("INVALID_TIME_RANGE")) {
        return "End time must be after start time.";
    }

    if (message.includes("CANNOT_SCHEDULE_IN_PAST")) {
        return "You cannot schedule a test in the past.";
    }

    if (message.includes("DURATION_EXCEEDS_DISTRIBUTION_WINDOW")) {
        return "Duration cannot exceed the scheduled time window.";
    }

    if (message.includes("TEST_GAP_CONFLICT")) {
        return message;
    }

    return "Failed to create test distribution";
}
