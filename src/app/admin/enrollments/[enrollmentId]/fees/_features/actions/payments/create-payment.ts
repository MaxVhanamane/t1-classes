/**
 * Record an admin-received payment.
 * - Positive values only
 * - No decimals
 * - Immutable financial ledger entry
 */
"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";

import {
    RecordPaymentSubmitInput,
    recordPaymentSubmitSchema,
} from "../../zod/payment.schema";

import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

export async function createPayment(
    enrollmentId: string,
    rawData: RecordPaymentSubmitInput,
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
            recordPaymentSubmitSchema.safeParse(
                rawData,
            );

        if (!parsed.success) {
            return {
                error:
                    "Invalid payment data.",
            };
        }

        const {
            amount,
            paymentMethod,
            paidAt,
            notes,
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
           blocked if manually deactivated
        --------------------------------------- */

        if (
            enrollment.is_active ===
            false
        ) {
            return {
                error:
                    "Cannot record payment for an inactive enrollment.",
            };
        }

        /* ---------------------------------------
           4. Insert payment row
        --------------------------------------- */

        const { error } =
            await supabase
                .from("payments")
                .insert({
                    enrollment_id:
                        enrollmentId,

                    /* ledger */
                    amount:
                        Number(amount),

                    transaction_type:
                        "payment",

                    status:
                        "success",

                    /* classification */
                    payment_method:
                        paymentMethod,

                    payment_origin:
                        "admin",

                    /* timestamps */
                    paid_at: paidAt,

                    /* optional meta */
                    notes:
                        notes?.trim() ||
                        null,

                    failure_reason:
                        null,

                    refund_reason:
                        null,

                    /* actor */
                    created_by:
                        admin.userId,

                    /* admin payment = no gateway */
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

        /* ---------------------------------------
           5. Refresh UI
        --------------------------------------- */

        revalidatePath(
            `/admin/enrollments/${enrollmentId}/fees`,
        );

    } catch (error) {
        console.error(
            "[CREATE_PAYMENT_ERROR]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
