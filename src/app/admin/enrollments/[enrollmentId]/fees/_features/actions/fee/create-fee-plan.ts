"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

import {
    FeePlanSubmitInput,
    feePlanSubmitSchema,
} from "../../zod/feePlan.schema";

import { ServerActionResponse } from "@/src/types/server-action";

type EnrollmentPricingRow =
    | {
        id: string;
        target_type: "course";
        course: {
            list_price: number;
            sale_price: number;
        } | null;
        batch: null;
    }
    | {
        id: string;
        target_type: "batch";
        course: null;
        batch: {
            list_price: number;
            sale_price: number;
        } | null;
    };

export async function createFeePlan(
    enrollmentId: string,
    rawData: FeePlanSubmitInput,
): Promise<ServerActionResponse> {
    const admin = await requireAdminServerOnly();

    try {
        const parsed = feePlanSubmitSchema.safeParse(rawData);

        if (!parsed.success) {
            return {
                error: "Invalid fee plan data.",
            };
        }

        const {
            discountAmount,
            discountReason,
        } = parsed.data;

        const supabase =
            await createServerSupabaseClient();

        /**
         * Fetch pricing snapshot
         */
        const {
            data: enrollment,
            error: enrollmentError,
        } = await supabase
            .from("enrollments")
            .select(`
        id,
        target_type,
        course:course_id (
          list_price,
          sale_price
        ),
        batch:batch_id (
          list_price,
          sale_price
        )
      `)
            .eq("id", enrollmentId)
            .single<EnrollmentPricingRow>();

        if (
            enrollmentError ||
            !enrollment
        ) {
            return {
                error: "Enrollment not found.",
            };
        }

        let listPrice = 0;
        let salePrice = 0;

        if (
            enrollment.target_type ===
            "course"
        ) {
            if (!enrollment.course) {
                return {
                    error:
                        "Course pricing not found.",
                };
            }

            listPrice = Number(
                enrollment.course.list_price,
            );

            salePrice = Number(
                enrollment.course.sale_price,
            );
        } else {
            if (!enrollment.batch) {
                return {
                    error:
                        "Batch pricing not found.",
                };
            }

            listPrice = Number(
                enrollment.batch.list_price,
            );

            salePrice = Number(
                enrollment.batch.sale_price,
            );
        }

        /**
         * Check existing active plan
         */
        const {
            data: existing,
        } = await supabase
            .from("fee_plans")
            .select("id")
            .eq(
                "enrollment_id",
                enrollmentId,
            )
            .eq("status", "active")
            .maybeSingle();

        if (existing) {
            return {
                error:
                    "Active fee plan already exists.",
            };
        }

        /**
         * Create fee plan
         */
        const { error } =
            await supabase
                .from("fee_plans")
                .insert({
                    enrollment_id:
                        enrollmentId,

                    discount_amount:
                        discountAmount,

                    discount_reason:
                        discountReason
                            ?.trim()
                            .toLowerCase() ||
                        null,

                    created_by:
                        admin.userId,

                    currency: "INR",

                    status: "active",

                    list_price_at_creation:
                        listPrice,

                    sale_price_at_creation:
                        salePrice,
                });

        if (error) {
            if (
                error.code === "23505"
            ) {
                return {
                    error:
                        "Active fee plan already exists.",
                };
            }

            return {
                error: error.message,
            };
        }


    } catch (error) {
        console.error(
            "[CREATE_FEE_PLAN_ERROR]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
