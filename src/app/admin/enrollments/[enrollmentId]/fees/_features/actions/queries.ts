"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { FeePlanHistoryRow } from "../types/fee-types";

export async function getFeeData(enrollmentId: string) {
  const supabase = await createServerSupabaseClient();

  /**
   * 1. Active fee plan (single)
   */
  const { data: activeFeePlan, error } = await supabase
    .from("fee_plans")
    .select(`
      id,
      enrollment_id,
      total_amount,
      discount_amount,
      final_amount,
      effective_from,
      status,
      is_active,
      notes,
      created_at,
      updated_at,
      created_by,
      updated_by
    `)
    .eq("enrollment_id", enrollmentId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  /**
   * 2. Fee plan history (read-only)
   */
  const { data: feeHistory } = await supabase
    .from("fee_plans")
    .select(`
      id,
      total_amount,
      discount_amount,
      final_amount,
      effective_from,
      status,
      notes,
      created_at,
      updated_at,
      created_by,
      updated_by
    `)
    .eq("enrollment_id", enrollmentId)
    .eq("is_active", false)
    .order("effective_from", { ascending: false })
    .order("created_at", { ascending: false });

  /**
   * 3. Fee status (derived view)
   */
  const { data: feeStatus } = await supabase
    .from("enrollment_fee_status")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();

  return {
    activeFeePlan,
    feeHistory: (feeHistory ?? []) as FeePlanHistoryRow[],
    feeStatus,
  };
}
