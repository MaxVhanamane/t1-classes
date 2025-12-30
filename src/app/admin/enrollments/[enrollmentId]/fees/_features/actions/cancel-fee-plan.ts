"use server";

import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";


export async function cancelFeePlan(feePlanId: string) {
    const supabase = await createServerSupabaseClient();
    const admin = await getCurrentAdmin();

    // 1. Fetch fee plan (need enrollment_id)
    const { data: feePlan, error: planError } = await supabase
        .from("fee_plans")
        .select("id, enrollment_id, is_active")
        .eq("id", feePlanId)
        .single();

    if (planError || !feePlan) {
        throw new Error("Fee plan not found.");
    }

    if (!feePlan.is_active) {
        throw new Error("Fee plan is not active.");
    }

    const enrollmentId = feePlan.enrollment_id;

    // 2. Ensure no successful payments exist
    const { count: paymentCount, error: paymentError } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("enrollment_id", enrollmentId)
        .eq("status", "success");

    if (paymentError) {
        throw new Error("Failed to verify payments.");
    }

    if (paymentCount && paymentCount > 0) {
        throw new Error(
            "Successful payments exist. Fee plan cannot be cancelled."
        );
    }

    // 3. Cancel fee plan
    const { error: updateError } = await supabase
        .from("fee_plans")
        .update({
            status: "cancelled",
            is_active: false,
            updated_at: new Date().toISOString(),
            updated_by: admin.id,
        })
        .eq("id", feePlanId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    // 4. Revalidate fees page
    revalidatePath(`/admin/enrollments/${enrollmentId}/fees`);
}
