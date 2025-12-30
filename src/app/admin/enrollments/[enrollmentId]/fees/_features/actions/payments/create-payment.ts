"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";
import { RecordPaymentSubmitInput, recordPaymentSubmitSchema } from "../../zod/payment.schema";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";


/**
 * Record an admin-received payment.
 * - No negative values
 * - No decimals
 * - Immutable financial record
 */

export async function createPayment(
    enrollmentId: string,
    rawData: RecordPaymentSubmitInput
) {
    // 1 Validate input (server is final authority)
    const parsed = recordPaymentSubmitSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid payment data.");
    }

    const { amount, paymentMethod, paidAt, notes } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const admin = await getCurrentAdmin();



    // 2 Ensure enrollment exists and is active
    const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("id", enrollmentId)
        .single();

    if (enrollmentError || !enrollment) {
        throw new Error("Enrollment not found.");
    }

    if (enrollment.status === "cancelled") {
        throw new Error("Cannot record payment for a cancelled enrollment.");
    }

    // 3 Insert payment (ADMIN payment)
    const { error } = await supabase.from("payments").insert({
        enrollment_id: enrollmentId,

        // financial
        amount: amount,
        status: "success",

        // classification
        payment_method: paymentMethod,
        payment_origin: "admin",

        // timing
        paid_at: paidAt,

        // metadata
        notes: notes ?? null,
        failure_reason: null,

        // actor 
        processed_by_user_id: admin.id,
        processed_by_user_name: admin.full_name,

        // gateway fields MUST be null for admin payments
        gateway: null,
        gateway_payment_id: null,
        gateway_order_id: null,
    });

    if (error) {
        throw new Error(error.message);
    }

    // 4 Revalidate fees page
    revalidatePath(`/admin/enrollments/${enrollmentId}/fees`);
}
