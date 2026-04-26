"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { Payment } from "../../types/payment.types";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";


export async function getPaymentsForEnrollment(
    enrollmentId: string
): Promise<Payment[]> {
    await requireAdminServerOnly();

    const supabase =
        await createServerSupabaseClient();

    const { data, error } =
        await supabase
            .from("payments")
            .select(`
        id,
        enrollment_id,
        amount,
        transaction_type,
        status,
        payment_method,
        payment_origin,
        paid_at,
        created_at,
        notes,
        refund_reason,
        failure_reason,
        users:created_by (
        full_name
      )
      `)
            .eq(
                "enrollment_id",
                enrollmentId
            )
            .order(
                "created_at",
                {
                    ascending: false,
                }
            )
            .overrideTypes<
                Payment[]
            >();

    if (error) {
        throw new Error(
            error.message
        );
    }

    return (
        data ?? []
    );
}
