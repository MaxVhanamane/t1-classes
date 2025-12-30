import { z } from "zod";

/**
 * 1 CLIENT FORM SCHEMA (strings only)
 */
export const feePlanFormSchema = z
    .object({
        totalAmount: z
            .string()
            .min(1, "Total amount is required")
            .regex(/^\d+$/, "Only whole numbers allowed"),

        discountAmount: z
            .string()
            .optional()
            .refine(
                (v) => v === undefined || v === "" || /^\d+$/.test(v),
                "Only whole numbers allowed"
            ),

        effectiveFrom: z.string().min(1, "Effective date is required"),
        notes: z.string().optional(),
    })
    .refine(
        (data) => {
            const total = Number(data.totalAmount);
            const discount = Number(data.discountAmount || 0);
            return discount <= total;
        },
        {
            message: "Discount cannot be greater than total amount",
            path: ["discountAmount"],
        }
    );

export type FeePlanFormInput = z.infer<
    typeof feePlanFormSchema
>;

/**
 * 2 SERVER SUBMIT SCHEMA (numbers only)
 */
export const feePlanSubmitSchema = z.object({
    totalAmount: z.number().min(0),
    discountAmount: z.number().min(0),
    effectiveFrom: z.string(),
    notes: z.string().optional(),
});

export type FeePlanSubmitInput = z.infer<
    typeof feePlanSubmitSchema
>;
