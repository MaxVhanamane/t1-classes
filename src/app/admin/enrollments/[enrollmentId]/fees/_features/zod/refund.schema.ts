import { z } from "zod";

/**
 * DB values
 */
export const refundReasonValues = [
    "overpayment",
    "duplicate_payment",
    "entry_error",
    "service_issue",
    "course_withdrawal",
    "batch_cancelled",
    "special_approval",
] as const;

export type RefundReason =
    (typeof refundReasonValues)[number];

/**
 * UI labels
 * Use these in Select dropdown
 */
export const refundReasonOptions: {
    value: RefundReason;
    label: string;
}[] = [
        {
            value: "overpayment",
            label: "Overpayment",
        },
        {
            value: "duplicate_payment",
            label: "Duplicate payment",
        },
        {
            value: "entry_error",
            label: "Incorrect payment entry",
        },
        {
            value: "service_issue",
            label: "Service issue",
        },
        {
            value: "course_withdrawal",
            label: "Student withdrew from course",
        },
        {
            value: "batch_cancelled",
            label: "Batch cancelled by institute",
        },
        {
            value: "special_approval",
            label: "Special management approval",
        },
    ];

/**
 * CLIENT FORM SCHEMA
 */
export const refundFormSchema =
    z.object({
        amount: z
            .string()
            .min(
                1,
                "Refund amount is required"
            )
            .regex(
                /^\d+$/,
                "Only whole numbers allowed"
            ),

        refundedAt: z
            .string()
            .min(
                1,
                "Refund date is required"
            ),

        paymentMethod: z
            .string()
            .min(
                1,
                "Refund method is required"
            ),

        refundReason: z.enum(
            refundReasonValues,
            {
                message:
                    "Refund reason is required",
            }
        ),
    });

export type RefundFormInput =
    z.infer<
        typeof refundFormSchema
    >;

/**
 * SERVER SUBMIT SCHEMA
 */
export const refundSubmitSchema =
    z.object({
        amount: z
            .number()
            .int()
            .positive(),

        refundedAt: z.string(),

        paymentMethod:
            z.string(),

        refundReason: z.enum(
            refundReasonValues
        ),
    });

export type RefundSubmitInput =
    z.infer<
        typeof refundSubmitSchema
    >;
