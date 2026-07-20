"use server";

import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";

export async function deleteFeePlan(
    feePlanId: string
): Promise<ServerActionResponse> {
    await requireAdminServerOnly();

    try {
        const supabase =
            await createServerSupabaseClient();

        /**
         * 1. Fetch fee plan
         */
        const {
            data: feePlan,
            error: planError,
        } = await supabase
            .from("fee_plans")
            .select(
                "id, enrollment_id, status"
            )
            .eq("id", feePlanId)
            .single();

        if (
            planError ||
            !feePlan
        ) {
            return {
                error:
                    "Fee plan not found.",
            };
        }

        if (
            feePlan.status !==
            "active"
        ) {
            return {
                error:
                    "Only active fee plans can be deleted.",
            };
        }

        const enrollmentId =
            feePlan.enrollment_id;

        /**
         * 2. Ensure no successful payments exist
         * Includes refunds automatically because
         * net amount can become zero/negative.
         */
        const {
            data: payments,
            error: paymentError,
        } = await supabase
            .from("payments")
            .select("amount")
            .eq(
                "enrollment_id",
                enrollmentId
            )
            .eq(
                "status",
                "success"
            );

        if (paymentError) {
            return {
                error:
                    "Failed to verify payments.",
            };
        }

        const netPaid =
            (
                payments ?? []
            ).reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.amount
                    ),
                0
            );

        if (netPaid > 0) {
            return {
                error:
                    "Payments exist. Fee plan cannot be deleted.",
            };
        }

        /**
         * 3. Delete fee plan
         */
        const {
            data: deletedRows,
            error: deleteError,
        } = await supabase
            .from("fee_plans")
            .delete()
            .eq("id", feePlanId)
            .eq("status", "active")
            .select("id");

        if (deleteError) {
            return {
                error:
                    deleteError.message,
            };
        }

        if (
            !deletedRows ||
            deletedRows.length === 0
        ) {
            return {
                error:
                    "Fee plan could not be deleted.",
            };
        }


    } catch (error) {
        console.error(
            "[DELETE_FEE_PLAN_ERROR]",
            error
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
