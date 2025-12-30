"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { FeePlanSubmitInput, feePlanSubmitSchema } from "../zod/feePlan.schema";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";
import { revalidatePath } from "next/cache";




export async function createFeePlan(
    enrollmentId: string,
    rawData: FeePlanSubmitInput
) {
    // 1. Validate input
    const parsed = feePlanSubmitSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid fee plan data.");
    }

    const { totalAmount, discountAmount, effectiveFrom, notes } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const admin = await getCurrentAdmin();


    // 3. Ensure enrollment exists
    const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("id", enrollmentId)
        .single();

    if (enrollmentError || !enrollment) {
        throw new Error("Enrollment not found.");
    }

    // 4. Ensure no active fee plan exists
    const { data: existing } = await supabase
        .from("fee_plans")
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .eq("is_active", true)
        .maybeSingle();

    if (existing) {
        throw new Error("Active fee plan already exists.");
    }

    // 5. Insert fee plan
    const { error } = await supabase.from("fee_plans").insert({
        enrollment_id: enrollmentId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        effective_from: effectiveFrom,
        notes: notes ?? null,

        // system-controlled
        created_by: admin.id,
        currency: "INR",
        status: "active",
        is_active: true,
    });

    // 6. Handle race-condition uniqueness failure
    if (error) {
        if (error.code === "23505") {
            throw new Error("Active fee plan already exists.");
        }
        throw new Error(error.message);
    }

    // 7. Revalidate UI
    revalidatePath(`/admin/enrollments/${enrollmentId}/fees`);
}


export async function updateFeePlan(
    feePlanId: string,
    rawData: FeePlanSubmitInput
) {
    // 1. Validate input
    const parsed = feePlanSubmitSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid fee plan data.");
    }

    const supabase = await createServerSupabaseClient();
    const admin = await getCurrentAdmin();


    // 3. Fetch fee plan (need enrollment_id and active status)
    const { data: feePlan, error: feePlanError } = await supabase
        .from("fee_plans")
        .select("enrollment_id, is_active, status")
        .eq("id", feePlanId)
        .single();

    if (feePlanError || !feePlan) {
        throw new Error("Fee plan not found.");
    }

    if (!feePlan.is_active || feePlan.status !== "active") {
        throw new Error("Only active fee plans can be edited.");
    }

    const enrollmentId = feePlan.enrollment_id;

    // 4. Block edit if successful payments exist
    const { count: paymentCount, error: paymentError } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("enrollment_id", enrollmentId)
        .eq("status", "success");

    if (paymentError) {
        throw new Error("Failed to verify payments.");
    }

    if (paymentCount && paymentCount > 0) {
        throw new Error("Successful payments exist. Fee plan cannot be edited.");
    }

    // 5. Update fee plan
    const { error } = await supabase
        .from("fee_plans")
        .update({
            total_amount: parsed.data.totalAmount,
            discount_amount: parsed.data.discountAmount,
            effective_from: parsed.data.effectiveFrom,
            notes: parsed.data.notes ?? null,
            updated_by: admin.id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", feePlanId);

    if (error) {
        throw new Error(error.message);
    }

    // 6. Revalidate UI
    revalidatePath(`/admin/enrollments/${enrollmentId}/fees`);
}


export async function supersedeFeePlan(
    oldFeePlanId: string,
    enrollmentId: string,
    rawData: FeePlanSubmitInput
) {
    // 1. Validate input
    const parsed = feePlanSubmitSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid fee plan data.");
    }

    const supabase = await createServerSupabaseClient();
    const admin = await getCurrentAdmin();


    // 3. Ensure old plan exists, is active, and belongs to enrollment
    const { data: oldPlan, error: oldPlanError } = await supabase
        .from("fee_plans")
        .select("id, is_active, enrollment_id")
        .eq("id", oldFeePlanId)
        .single();

    if (
        oldPlanError ||
        !oldPlan ||
        !oldPlan.is_active ||
        oldPlan.enrollment_id !== enrollmentId
    ) {
        throw new Error("Fee plan cannot be superseded.");
    }

    // 4. Ensure at least one successful payment exists
    const { count: paymentCount, error: paymentError } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("enrollment_id", enrollmentId)
        .eq("status", "success");

    if (paymentError) {
        throw new Error("Failed to verify payments.");
    }

    if (!paymentCount || paymentCount === 0) {
        throw new Error("No successful payments found. Edit instead of supersede.");
    }

    // 5. Atomic supersede via RPC
    const { error } = await supabase.rpc("supersede_fee_plan", {
        old_fee_plan_id: oldFeePlanId,
        enrollment_id: enrollmentId,
        total_amount: parsed.data.totalAmount,
        discount_amount: parsed.data.discountAmount,
        effective_from: parsed.data.effectiveFrom,
        notes: parsed.data.notes ?? null,
        admin_id: admin.id,
    });

    if (error) {
        throw new Error(error.message);
    }

    // 6. Revalidate UI
    revalidatePath(`/admin/enrollments/${enrollmentId}/fees`);
}




