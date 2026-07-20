"use server";


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import {
    RefundSubmitInput,
    refundSubmitSchema,
} from "../../zod/refund.schema";

import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

export async function createRefund(
    enrollmentId: string,
    rawData: RefundSubmitInput,
): Promise<ServerActionResponse> {
    /* ---------------------------------------
       Keep auth outside try/catch
    --------------------------------------- */

    const admin =
        await requireAdminServerOnly();

    try {
        /* ---------------------------------------
           1. Validate input
        --------------------------------------- */

        const parsed =
            refundSubmitSchema.safeParse(
                rawData,
            );

        if (!parsed.success) {
            return {
                error:
                    "Invalid refund data.",
            };
        }

        const {
            amount,
            refundedAt,
            paymentMethod,
            refundReason,
        } = parsed.data;

        const supabase =
            await createServerSupabaseClient();

        /* ---------------------------------------
           2. Ensure enrollment exists
        --------------------------------------- */

        const {
            data: enrollment,
            error:
            enrollmentError,
        } = await supabase
            .from("enrollments")
            .select(
                `
        id,
        is_active,
        access_starts_at,
        access_ends_at
      `,
            )
            .eq("id", enrollmentId)
            .single();

        if (
            enrollmentError ||
            !enrollment
        ) {
            return {
                error:
                    "Enrollment not found.",
            };
        }

        /* ---------------------------------------
           3. Optional guard:
           blocked if manually inactive
        --------------------------------------- */

        if (
            enrollment.is_active ===
            false
        ) {
            return {
                error:
                    "Cannot issue refund for an inactive enrollment.",
            };
        }

        /* ---------------------------------------
           4. Insert refund row
           Refunds are negative ledger entries
        --------------------------------------- */

        const { error } =
            await supabase
                .from("payments")
                .insert({
                    enrollment_id:
                        enrollmentId,

                    /* ledger */
                    amount:
                        -Number(amount),

                    transaction_type:
                        "refund",

                    status:
                        "success",

                    /* classification */
                    payment_method:
                        paymentMethod,

                    payment_origin:
                        "admin",

                    /* timing */
                    paid_at:
                        refundedAt,

                    /* metadata */
                    refund_reason:
                        refundReason,

                    notes: null,
                    failure_reason:
                        null,

                    /* actor */
                    created_by:
                        admin.userId,

                    /* admin refund = no gateway */
                    gateway: null,
                    gateway_payment_id:
                        null,
                    gateway_order_id:
                        null,
                });

        if (error) {
            return {
                error:
                    error.message,
            };
        }



    } catch (error) {
        console.error(
            "[CREATE_REFUND_ERROR]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
