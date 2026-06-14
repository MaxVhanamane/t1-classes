import "server-only";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";


import {
    AuditUser,
    EnrollmentFeesData,
    EnrollmentFeePlan,
    EnrollmentPayment,
    EnrollmentPricing,
    FeeStatus,
} from "../types/enrollment-fees-data.types";

type EnrollmentResult = {
    id: string;

    target_type: "course" | "batch";

    student: {
        id: string;
        full_name: string;
        phone: string | null;
    };

    course: {
        id: string;
        title: string;
        list_price: number;
        sale_price: number;
        currency?: string;
    } | null;

    batch: {
        id: string;
        title: string;
        list_price: number;
        sale_price: number;
        currency?: string;
    } | null;
};

type AuditUserRow = {
    id: string;
    full_name: string | null;
};

type PaymentQueryRow = {
    id: string;

    enrollment_id: string;

    amount: number;

    transaction_type:
    | "payment"
    | "refund";

    status:
    | "pending"
    | "success"
    | "failed";

    payment_method:
    | "cash"
    | "upi"
    | "card"
    | "netbanking"
    | "wallet"
    | "bank_transfer";

    payment_origin:
    | "admin"
    | "self_serve";

    paid_at: string;

    created_at: string;

    notes: string | null;

    refund_reason: string | null;

    failure_reason: string | null;

    created_by_user:
    | AuditUserRow
    | null;
};

type FeePlanQueryRow = {
    id: string;

    enrollment_id: string;

    discount_amount: number;

    final_amount: number;

    list_price_at_creation: number;

    sale_price_at_creation: number;

    currency: string;

    status:
    | "active"
    | "superseded";

    discount_reason: string | null;

    created_at: string;

    updated_at: string | null;

    created_by_user:
    | AuditUserRow
    | null;

    updated_by_user:
    | AuditUserRow
    | null;
};

function mapAuditUser(
    user:
        | AuditUserRow
        | null
        | undefined
): AuditUser | null {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        fullName: user.full_name,
    };
}

export async function getEnrollmentFeesData(
    enrollmentId: string
): Promise<EnrollmentFeesData> {
    const supabase =
        await createServerSupabaseClient();

    /* ---------------------------------- */
    /* Pricing Context                    */
    /* ---------------------------------- */

    const {
        data: enrollment,
        error:
        enrollmentError,
    } = await supabase
        .from("enrollments")
        .select(`
  id,
  target_type,

  student:user_id (
    id,
    full_name,
    phone
  ),

  course:course_id (
    id,
    title,
    list_price,
    sale_price,
    currency
  ),

  batch:batch_id (
    id,
    title,
    list_price,
    sale_price,
    currency
  )
`)
        .eq("id", enrollmentId)
        .single<EnrollmentResult>();

    if (
        enrollmentError ||
        !enrollment
    ) {
        throw new Error(
            "Failed to fetch enrollment pricing context"
        );
    }

    let pricing: EnrollmentPricing;

    if (
        enrollment.target_type ===
        "course"
    ) {
        if (
            !enrollment.course
        ) {
            throw new Error(
                "Course not found for enrollment"
            );
        }

        pricing = {
            targetType:
                "course",

            title:
                enrollment.course
                    .title,

            listPrice:
                Number(
                    enrollment
                        .course
                        .list_price
                ),

            salePrice:
                Number(
                    enrollment
                        .course
                        .sale_price
                ),
        };
    } else {
        if (
            !enrollment.batch
        ) {
            throw new Error(
                "Batch not found for enrollment"
            );
        }

        pricing = {
            targetType:
                "batch",

            title:
                enrollment.batch
                    .title,

            listPrice:
                Number(
                    enrollment
                        .batch
                        .list_price
                ),

            salePrice:
                Number(
                    enrollment
                        .batch
                        .sale_price
                ),
        };
    }


    const enrollmentContext = {
        id: enrollment.id,

        student: {
            id: enrollment.student.id,

            fullName:
                enrollment.student.full_name,

            phone:
                enrollment.student.phone,
        },

        target: {
            type: enrollment.target_type,

            title:
                enrollment.target_type ===
                    "course"
                    ? enrollment.course!.title
                    : enrollment.batch!.title,
        },
    };

    /* ---------------------------------- */
    /* Payments                           */
    /* ---------------------------------- */

    const {
        data: payments,
        error: paymentsError,
    } = await supabase
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
    created_by_user:users!payments_created_by_fkey (
      id,
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
            PaymentQueryRow[]
        >();

    if (
        paymentsError
    ) {
        throw new Error(
            paymentsError.message
        );
    }

    const normalizedPayments: EnrollmentPayment[] =
        (
            (payments ??
                [])
        ).map(
            (payment) => ({
                id: payment.id,

                enrollment_id:
                    payment.enrollment_id,

                amount:
                    Number(
                        payment.amount
                    ),

                transaction_type:
                    payment.transaction_type,

                status:
                    payment.status,

                payment_method:
                    payment.payment_method,

                payment_origin:
                    payment.payment_origin,

                paid_at:
                    payment.paid_at,

                created_at:
                    payment.created_at,

                notes:
                    payment.notes,

                refund_reason:
                    payment.refund_reason,

                failure_reason:
                    payment.failure_reason,

                created_by:
                    mapAuditUser(
                        payment.created_by_user
                    ),
            })
        );

    /* ---------------------------------- */
    /* Active Fee Plan                    */
    /* ---------------------------------- */

    const {
        data: activeFeePlan,
        error: activeError,
    } = await supabase
        .from("fee_plans")
        .select(`
    id,
    enrollment_id,
    discount_amount,
    final_amount,
    list_price_at_creation,
    sale_price_at_creation,
    currency,
    status,
    discount_reason,
    created_at,
    updated_at,
    created_by_user:users!fee_plans_created_by_fkey (
      id,
      full_name
    ),
    updated_by_user:users!fee_plans_updated_by_fkey (
      id,
      full_name
    )
  `)
        .eq(
            "enrollment_id",
            enrollmentId
        )
        .eq(
            "status",
            "active"
        )
        .maybeSingle()
        .overrideTypes<
            FeePlanQueryRow | null
        >();

    if (
        activeError
    ) {
        throw new Error(
            activeError.message
        );
    }

    let normalizedActiveFeePlan:
        | EnrollmentFeePlan
        | null =
        null;

    if (
        activeFeePlan
    ) {
        const plan = activeFeePlan as unknown as FeePlanQueryRow;
        normalizedActiveFeePlan =
        {
            id: plan.id,

            enrollment_id:
                plan.enrollment_id,


            discount_amount:
                Number(
                    plan.discount_amount
                ),

            final_amount:
                Number(
                    plan.final_amount
                ),

            list_price_at_creation:
                Number(
                    plan.list_price_at_creation
                ),

            sale_price_at_creation:
                Number(
                    plan.sale_price_at_creation
                ),

            currency:
                plan.currency,

            status:
                plan.status,

            discount_reason:
                plan.discount_reason,

            created_at:
                plan.created_at,

            updated_at:
                plan.updated_at,

            created_by:
                mapAuditUser(
                    plan.created_by_user
                ),

            updated_by:
                mapAuditUser(
                    plan.updated_by_user
                ),
        };
    }

    /* ---------------------------------- */
    /* Fee History                        */
    /* ---------------------------------- */

    const {
        data: feeHistory,
        error: historyError,
    } = await supabase
        .from("fee_plans")
        .select(`
    id,
    enrollment_id,
    discount_amount,
    final_amount,
    list_price_at_creation,
    sale_price_at_creation,
    currency,
    status,
    discount_reason,
    created_at,
    updated_at,
    created_by_user:users!fee_plans_created_by_fkey (
      id,
      full_name
    ),
    updated_by_user:users!fee_plans_updated_by_fkey (
      id,
      full_name
    )
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
        )
        .overrideTypes<
            FeePlanQueryRow[]
        >();

    if (
        historyError
    ) {
        throw new Error(
            historyError.message
        );
    }

    const normalizedFeeHistory: EnrollmentFeePlan[] =
        (
            (feeHistory ??
                [])
        ).map(
            (plan) => ({
                id: plan.id,

                enrollment_id:
                    plan.enrollment_id!,


                discount_amount:
                    Number(
                        plan.discount_amount
                    ),

                final_amount:
                    Number(
                        plan.final_amount
                    ),

                list_price_at_creation:
                    Number(
                        plan.list_price_at_creation
                    ),

                sale_price_at_creation:
                    Number(
                        plan.sale_price_at_creation
                    ),

                currency:
                    plan.currency,

                status:
                    plan.status,

                discount_reason:
                    plan.discount_reason,

                created_at:
                    plan.created_at,

                updated_at:
                    plan.updated_at,

                created_by:
                    mapAuditUser(
                        plan.created_by_user
                    ),

                updated_by:
                    mapAuditUser(
                        plan.updated_by_user
                    ),
            })
        );

    /* ---------------------------------- */
    /* Fee Status                         */
    /* ---------------------------------- */

    const {
        data: successfulPayments,

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
        )
        .overrideTypes<
            {
                amount: number;
            }[]
        >();

    let feeStatus:
        | FeeStatus
        | null =
        null;

    if (
        normalizedActiveFeePlan
    ) {
        const paidAmount =
            (
                successfulPayments ??
                []
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
            normalizedActiveFeePlan.final_amount;

        feeStatus = {
            final_amount:
                finalAmount,

            paid_amount:
                paidAmount,

            pending_amount:
                Math.max(
                    finalAmount -
                    paidAmount,
                    0
                ),

            overpaid_amount:
                Math.max(
                    paidAmount -
                    finalAmount,
                    0
                ),
        };
    }

    /* ---------------------------------- */
    /* Response                           */
    /* ---------------------------------- */

    return {
        pricing,
        enrollment:
            enrollmentContext,

        payments:
            normalizedPayments,

        activeFeePlan:
            normalizedActiveFeePlan,

        feeHistory:
            normalizedFeeHistory,

        feeStatus,
    };
}
