import { z } from "zod";
import { MARKETING_LIMITS } from "@/src/lib/constants/marketing-limits";

export const batchSchema = z
    .object({
        /* --------------------------------------------------------- */
        /* Courses mapping                                           */
        /* --------------------------------------------------------- */
        course_ids: z
            .array(z.uuid())
            .min(1, "Select at least one course"),

        instructor_ids: z
            .array(z.uuid())
            .optional(),
        /* --------------------------------------------------------- */
        /* Basic info                                                */
        /* --------------------------------------------------------- */
        title: z
            .string()
            .min(1, "Batch title is required")
            .max(120, "Title must be 120 characters or less"),

        subtitle: z
            .string()
            .max(120, "Subtitle must be 120 characters or less")
            .nullable()
            .optional(),

        description: z.any().nullable().optional(),

        thumbnail_image: z.string().nullable().optional(),

        /* --------------------------------------------------------- */
        /* Academic metadata                                         */
        /* --------------------------------------------------------- */
        subjects: z
            .array(
                z.object({
                    value: z
                        .string()
                        .trim()
                        .min(1, "Subject cannot be empty")
                        .max(50, "Subject too long"),
                })
            )
            .max(10, "Too many subjects")
            .nullable()
            .optional(),

        class_level: z.number().int().positive().nullable().optional(),

        target_exam: z.string().nullable().optional(),

        /* --------------------------------------------------------- */
        /* Pricing                                                   */
        /* --------------------------------------------------------- */
        sale_price: z.number().min(0, "Sale price must be ≥ 0"),

        list_price: z.number().min(0, "List price must be ≥ 0"),

        /* --------------------------------------------------------- */
        /* Marketing content                                         */
        /* --------------------------------------------------------- */
        learning_outcomes: z
            .array(
                z.object({
                    value: z
                        .string()
                        .trim()
                        .min(1, "Outcome cannot be empty")
                        .max(
                            MARKETING_LIMITS.BATCH.LEARNING_OUTCOME_MAX,
                            `Max ${MARKETING_LIMITS.BATCH.LEARNING_OUTCOME_MAX} characters`
                        ),
                })
            )
            .max(MARKETING_LIMITS.BATCH.MAX_ITEMS)
            .nullable()
            .optional(),

        target_audience: z
            .array(
                z.object({
                    value: z
                        .string()
                        .trim()
                        .min(1, "Audience cannot be empty")
                        .max(
                            MARKETING_LIMITS.BATCH.TARGET_AUDIENCE_MAX,
                            `Max ${MARKETING_LIMITS.BATCH.TARGET_AUDIENCE_MAX} characters`
                        ),
                })
            )
            .max(MARKETING_LIMITS.BATCH.MAX_ITEMS)
            .nullable()
            .optional(),

        /* --------------------------------------------------------- */
        /* Delivery config                                           */
        /* --------------------------------------------------------- */
        mode: z.enum(["offline", "online", "hybrid"]),

        capacity: z.number().int().positive().nullable().optional(),

        languages: z
            .array(z.string())
            .min(1, "Select at least one language"),

        location: z.string().nullable().optional(),

        /* --------------------------------------------------------- */
        /* Lifecycle                                                 */
        /* --------------------------------------------------------- */
        start_date: z.string().min(1, "Start date is required"),
        end_date: z.string().min(1, "End date is required"),

        /* --------------------------------------------------------- */
        /* Visibility & admissions                                   */
        /* --------------------------------------------------------- */
        is_active: z.boolean(),
        is_admission_open: z.boolean(),
    })

    /* ----------------------------------------------------------- */
    /* Lifecycle validation                                        */
    /* ----------------------------------------------------------- */
    .refine(
        (data) =>
            new Date(data.end_date) >= new Date(data.start_date),
        {
            message: "End date must be after start date",
            path: ["end_date"],
        }
    )

    /* ----------------------------------------------------------- */
    /* Pricing validation                                          */
    /* ----------------------------------------------------------- */
    .refine(
        (data) => data.list_price >= data.sale_price,
        {
            message: "List price must be ≥ sale price",
            path: ["list_price"],
        }
    );

export type BatchFormValues = z.infer<typeof batchSchema>;
