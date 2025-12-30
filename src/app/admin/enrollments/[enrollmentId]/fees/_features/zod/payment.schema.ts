import { z } from "zod";

/**
 * CLIENT FORM SCHEMA
 * - strings only
 * - no decimals
 * - no negatives
 */
export const recordPaymentFormSchema = z.object({
    amount: z
        .string()
        .min(1, "Amount is required")
        .regex(/^\d+$/, "Only whole numbers allowed"),

    paymentMethod: z.enum([
        "cash",
        "upi",
        "card",
        "netbanking",
        "wallet",
        "bank_transfer",
    ]),

    paidAt: z.string().min(1, "Payment date is required"),

    notes: z.string().optional(),
});

export type RecordPaymentFormInput = z.infer<
    typeof recordPaymentFormSchema
>;


/**
 * SERVER SUBMIT SCHEMA
 * - numeric values only
 */
export const recordPaymentSubmitSchema = z.object({
    amount: z.number().int().positive(),
    paymentMethod: z.enum([
        "cash",
        "upi",
        "card",
        "netbanking",
        "wallet",
        "bank_transfer",
    ]),
    paidAt: z.string(),
    notes: z.string().optional(),
});

export type RecordPaymentSubmitInput = z.infer<
    typeof recordPaymentSubmitSchema
>;
