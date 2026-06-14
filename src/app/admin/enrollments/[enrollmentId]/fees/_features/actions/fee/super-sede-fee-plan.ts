"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import {
    FeePlanSubmitInput,
    feePlanSubmitSchema,
} from "../../zod/feePlan.schema";

import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

export async function supersedeFeePlan(
    oldFeePlanId: string,
    enrollmentId: string,
    rawData: FeePlanSubmitInput,
): Promise<ServerActionResponse> {
    await requireAdminServerOnly();

    try {
        /**
         * 1. Validate input
         */
        const parsed = feePlanSubmitSchema.safeParse(rawData);

        if (!parsed.success) {
            return {
                error: "Invalid fee plan data.",
            };
        }

        const { discountAmount, discountReason } = parsed.data;

        const supabase = await createServerSupabaseClient();

        /**
         * 2. Ensure old plan exists
         */
        const {
            data: oldPlan,
            error: oldPlanError,
        } = await supabase
            .from("fee_plans")
            .select(`
        id,
        enrollment_id,
        status,
        final_amount,
        currency,
        list_price_at_creation,
        sale_price_at_creation
      `)
            .eq("id", oldFeePlanId)
            .single();

        if (
            oldPlanError ||
            !oldPlan ||
            oldPlan.status !== "active" ||
            oldPlan.enrollment_id !== enrollmentId
        ) {
            return {
                error: "Fee plan cannot be superseded.",
            };
        }

        /**
         * 3. Require payments
         */
        const {
            data: payments,
            error: paymentError,
        } = await supabase
            .from("payments")
            .select("amount")
            .eq("enrollment_id", enrollmentId)
            .eq("status", "success");

        if (paymentError) {
            return {
                error: "Failed to verify payments.",
            };
        }

        const paidAmount = (payments ?? []).reduce(
            (sum, row) => sum + Number(row.amount),
            0,
        );

        if (paidAmount <= 0) {
            return {
                error:
                    "No successful payments found. Edit instead of supersede.",
            };
        }

        /**
         * 4. Prevent new plan below already paid amount
         */
        const newFinalAmount =
            Number(oldPlan.sale_price_at_creation) -
            Number(discountAmount);

        if (newFinalAmount < paidAmount) {
            return {
                error: `Student has already paid ₹${paidAmount.toLocaleString()}. Refund excess amount before reducing fee below paid total.`,
            };
        }

        /**
         * 5. Supersede plan
         */
        const { error } = await supabase.rpc(
            "supersede_fee_plan",
            {
                p_old_fee_plan_id: oldFeePlanId,

                p_enrollment_id: enrollmentId,

                p_discount_amount: discountAmount,

                p_discount_reason:
                    discountReason?.trim().toLowerCase() ??
                    null,

                p_currency: oldPlan.currency,

                p_list_price_at_creation:
                    oldPlan.list_price_at_creation,

                p_sale_price_at_creation:
                    oldPlan.sale_price_at_creation,
            },
        );

        if (error) {
            return {
                error: error.message,
            };
        }


    } catch (error) {
        console.error(
            "[SUPERSEDE_FEE_PLAN_ERROR]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
