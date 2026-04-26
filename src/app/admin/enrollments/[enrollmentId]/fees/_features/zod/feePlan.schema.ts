import { z } from "zod";

/**
 * 1 CLIENT FORM SCHEMA (strings only)
 */
export const feePlanFormSchema = z
    .object({
        discountAmount: z
            .string()
            .optional()
            .refine(
                (v) =>
                    v === undefined ||
                    v === "" ||
                    /^\d+$/.test(v),
                "Only whole numbers allowed"
            ),

        discountReason: z.string().optional(),
    })
    .refine(
        (data) => {
            const discount = Number(
                data.discountAmount || 0
            );

            if (discount === 0) {
                return true;
            }

            return (
                (data.discountReason?.trim()
                    .length ?? 0) > 0
            );
        },
        {
            message:
                "Discount reason is required when discount is greater than zero",
            path: ["discountReason"],
        }
    );

export type FeePlanFormInput =
    z.infer<
        typeof feePlanFormSchema
    >;

/**
 * 2 SERVER SUBMIT SCHEMA (numbers only)
 */
export const feePlanSubmitSchema =
    z.object({
        discountAmount: z
            .number()
            .min(0),

        discountReason:
            z.string().optional(),
    });

export type FeePlanSubmitInput =
    z.infer<
        typeof feePlanSubmitSchema
    >;
