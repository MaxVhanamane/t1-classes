"use server";

import { PostgrestError } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { UpdateLeadInput, updateLeadSchema } from "../zod-schema/leads.schema";

export async function updateLead(
    id: string,
    input: UpdateLeadInput
): Promise<ServerActionResponse> {
    // Ensure the user is an admin/staff
    const staff = await requireAdminServerOnly();

    try {
        const parsed = updateLeadSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid lead update data",
            };
        }

        const data = parsed.data;
        const supabase = await createServerSupabaseClient();

        // Clean up lost_reason if status changed away from not_interested
        const finalLostReason =
            data.status === "not_interested" ? data.lost_reason : null;

        const { error } = await supabase
            .from("enrollment_leads")
            .update({
                status: data.status,
                next_follow_up_at: data.next_follow_up_at || null,
                lost_reason: finalLostReason,
                updated_by: staff.userId,
            })
            .eq("id", id);

        if (error) {
            const pgError = error as PostgrestError;
            console.error("[UPDATE_LEAD_DB]", pgError);
            return { error: "Failed to update lead." };
        }

    } catch (error) {
        console.error("[UPDATE_LEAD_FATAL]", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
