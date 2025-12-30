import { z } from "zod";

/**
 * CLIENT FORM SCHEMA (strings only)
 * Used by React Hook Form
 */
export const refundFormSchema = z.object({
    amount: z
        .string()
        .min(1, "Refund amount is required")
        .regex(/^\d+$/, "Only whole numbers allowed"),

    refundedAt: z.string().min(1, "Refund date is required"),

    paymentMethod: z.string().min(1, "Refund method is required"),

    reason: z
        .string()
        .min(3, "Refund reason must be at least 3 characters"),

    notes: z.string().optional(),
});

export type RefundFormInput = z.infer<typeof refundFormSchema>;

/**
 * SERVER SUBMIT SCHEMA (numbers only)
 * Final authority before DB insert
 */
export const refundSubmitSchema = z.object({
    amount: z.number().int().positive(),

    refundedAt: z.string(),

    paymentMethod: z.string(),

    reason: z.string().min(3),

    notes: z.string().optional(),
});

export type RefundSubmitInput = z.infer<
    typeof refundSubmitSchema
>;
