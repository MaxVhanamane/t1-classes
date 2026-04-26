"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { FeePlanHistoryRow } from "../types/fee-types";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function getFeeData(
  enrollmentId: string
) {
  await requireAdminServerOnly();

  const supabase =
    await createServerSupabaseClient();

  /**
   * 1. Active fee plan
   */
  const {
    data: activeFeePlan,
    error: activeError,
  } = await supabase
    .from("fee_plans")
    .select(`
      id,
      enrollment_id,
      offered_amount,
      discount_amount,
      final_amount,
      list_price_at_creation,
      sale_price_at_creation,
      currency,
      status,
      discount_reason,
      created_at,
      updated_at,
      created_by,
      updated_by
    `)
    .eq(
      "enrollment_id",
      enrollmentId
    )
    .eq(
      "status",
      "active"
    )
    .maybeSingle();

  if (activeError) {
    throw new Error(
      activeError.message
    );
  }

  /**
   * 2. History
   */
  const {
    data: feeHistory,
    error: historyError,
  } = await supabase
    .from("fee_plans")
    .select(`
      id,
      offered_amount,
      discount_amount,
      final_amount,
      list_price_at_creation,
      sale_price_at_creation,
      currency,
      status,
      discount_reason,
      created_at,
      updated_at,
      created_by,
      updated_by
    `)
    .eq(
      "enrollment_id",
      enrollmentId
    )
    .eq(
      "status",
      "superseded"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (historyError) {
    throw new Error(
      historyError.message
    );
  }

  /**
   * 3. Successful ledger entries
   * payments positive, refunds negative
   */
  const {
    data: payments,
    error: paymentsError,
  } = await supabase
    .from("payments")
    .select(`
      amount
    `)
    .eq(
      "enrollment_id",
      enrollmentId
    )
    .eq(
      "status",
      "success"
    );

  if (paymentsError) {
    throw new Error(
      paymentsError.message
    );
  }

  /**
   * 4. Derived fee status
   */
  let feeStatus = null;

  if (activeFeePlan) {
    const paidAmount =
      (
        payments ?? []
      ).reduce(
        (
          sum,
          payment
        ) =>
          sum +
          Number(
            payment.amount
          ),
        0
      );

    const finalAmount =
      Number(
        activeFeePlan.final_amount
      );

    const pendingAmount =
      Math.max(
        finalAmount -
        paidAmount,
        0
      );

    const overpaidAmount =
      Math.max(
        paidAmount -
        finalAmount,
        0
      );

    feeStatus = {
      final_amount:
        finalAmount,

      paid_amount:
        paidAmount,

      pending_amount:
        pendingAmount,

      overpaid_amount:
        overpaidAmount,
    };
  }

  return {
    activeFeePlan,

    feeHistory:
      (feeHistory ??
        []) as FeePlanHistoryRow[],

    feeStatus,
  };
}
