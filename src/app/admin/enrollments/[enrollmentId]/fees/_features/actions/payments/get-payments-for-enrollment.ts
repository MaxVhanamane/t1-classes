"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { Payment } from "../../types/payment.types";

export async function getPaymentsForEnrollment(enrollmentId: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("payments")
        .select(`
      id,
      enrollment_id,
      amount,
      status,
      payment_method,
      payment_origin,
      paid_at,
      created_at,
      notes,
      failure_reason,
      processed_by_user_name
    `)
        .eq("enrollment_id", enrollmentId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data as unknown) as Payment[];
}
