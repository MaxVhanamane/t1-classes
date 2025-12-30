"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";
import { RefundSubmitInput, refundSubmitSchema } from "../../zod/refund.schema";


export async function createRefund(
    enrollmentId: string,
    rawData: RefundSubmitInput
) {
    // 1. Validate input (server is final authority)
    const parsed = refundSubmitSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid refund data.");
    }

    const { amount, refundedAt, paymentMethod, reason, notes } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const admin = await getCurrentAdmin();

    // 2. Ensure enrollment exists
    const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("id", enrollmentId)
        .single();

    if (enrollmentError || !enrollment) {
        throw new Error("Enrollment not found.");
    }

    // 3. Block refunds for cancelled enrollments
    if (enrollment.status === "cancelled") {
        throw new Error("Cannot issue refund for a cancelled enrollment.");
    }

    // 4. Insert refund as a negative payment
    const { error } = await supabase.from("payments").insert({
        enrollment_id: enrollmentId,

        // financial
        amount: -amount,
        status: "success",

        // classification
        payment_method: paymentMethod,
        payment_origin: "admin",

        // timing
        paid_at: refundedAt,

        // metadata
        notes: `Refund: ${reason}${notes ? ` — ${notes}` : ""}`,
        failure_reason: null,

        // actor
        processed_by_user_id: admin.id,
        processed_by_user_name: admin.full_name,

        // gateway fields must be null for admin refunds
        gateway: null,
        gateway_payment_id: null,
        gateway_order_id: null,
    });

    if (error) {
        throw new Error(error.message);
    }

    // 5. Revalidate fees page
    revalidatePath(`/admin/enrollments/${enrollmentId}/fees`);
}
