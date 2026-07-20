"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

import {
    FeePlanSubmitInput,
    feePlanSubmitSchema,
} from "../../zod/feePlan.schema";

import { ServerActionResponse } from "@/src/types/server-action";

export async function updateFeePlan(
    feePlanId: string,
    rawData: FeePlanSubmitInput,
): Promise<ServerActionResponse> {
    const admin =
        await requireAdminServerOnly();

    try {
        /**
         * 1. Validate input
         */
        const parsed =
            feePlanSubmitSchema.safeParse(
                rawData,
            );

        if (!parsed.success) {
            return {
                error:
                    "Invalid fee plan data.",
            };
        }

        const {
            discountAmount,
            discountReason,
        } = parsed.data;

        const supabase =
            await createServerSupabaseClient();

        /**
         * 2. Fetch fee plan
         */
        const {
            data: feePlan,
            error: feePlanError,
        } = await supabase
            .from("fee_plans")
            .select(`
        id,
        enrollment_id,
        status
      `)
            .eq("id", feePlanId)
            .single();

        if (
            feePlanError ||
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
                    "Only active fee plans can be edited.",
            };
        }

        const enrollmentId =
            feePlan.enrollment_id;

        /**
         * 3. Block edits if any net payments exist
         * (payments minus refunds)
         */
        const {
            data: payments,
            error: paymentError,
        } = await supabase
            .from("payments")
            .select("amount")
            .eq(
                "enrollment_id",
                enrollmentId,
            )
            .eq(
                "status",
                "success",
            );

        if (paymentError) {
            return {
                error:
                    "Failed to verify payments.",
            };
        }

        const netPaid =
            (payments ?? []).reduce(
                (sum, row) =>
                    sum +
                    Number(row.amount),
                0,
            );

        if (netPaid > 0) {
            return {
                error:
                    "Payments exist. Fee plan cannot be edited.",
            };
        }

        /**
         * 4. Update fee plan
         */
        const { error } =
            await supabase
                .from("fee_plans")
                .update({
                    discount_amount:
                        discountAmount,

                    discount_reason:
                        discountReason
                            ?.trim()
                            .toLowerCase() ||
                        null,

                    updated_by:
                        admin.userId,

                    updated_at:
                        new Date().toISOString(),
                })
                .eq("id", feePlanId)
                .eq(
                    "status",
                    "active",
                );

        if (error) {
            return {
                error:
                    error.message,
            };
        }


    } catch (error) {
        console.error(
            "[UPDATE_FEE_PLAN_ERROR]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
