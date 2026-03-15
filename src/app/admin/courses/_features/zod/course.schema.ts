import { MARKETING_LIMITS } from "@/src/lib/constants/marketing-limits";
import { z } from "zod";

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

const optionalString = z
    .string()
    .trim()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined));

/* -------------------------------------------------- */
/* Enums                                              */
/* -------------------------------------------------- */

export const courseTypeEnum = z.enum([
    "academic",
    "foundation",
    "exam",
    "crash",
]);

/* -------------------------------------------------- */
/* TipTap JSON                                        */
/* -------------------------------------------------- */

export const descriptionSchema = z
    .record(z.string(), z.unknown())
    .nullable()
    .optional();

/* -------------------------------------------------- */
/* Main Schema                                        */
/* -------------------------------------------------- */

export const courseSchema = z
    .object({
        title: z.string().trim().min(1, "Title is required"),

        subtitle: optionalString,

        thumbnail_image: z.string().nullable().optional(),

        description: descriptionSchema,

        course_type: courseTypeEnum,

        class_level: z
            .coerce.number()
            .int()
            .positive("Class level must be greater than 0")
            .optional()
            .nullable(),

        board: optionalString,

        target_exam: optionalString,

        subjects: z
            .array(
                z.object({
                    value: z.string().trim().min(1),
                })
            )
            .optional()
            .nullable(),

        /* ---------- Pricing ---------- */

        list_price: z
            .coerce.number()
            .min(0, "List price cannot be negative"),

        sale_price: z
            .coerce.number()
            .min(0, "Sale price cannot be negative"),

        /* ---------- Languages ---------- */

        languages: z
            .array(
                z.object({
                    value: z.string().trim().min(1),
                })
            )
            .min(1, "At least one language is required"),

        /* ---------- Instructors ---------- */

        instructor_ids: z
            .array(z.string().uuid())
            .optional(),

        is_active: z.boolean(),

        /* ---------- Marketing Fields ---------- */

        learning_outcomes: z
            .array(
                z.object({
                    value: z
                        .string()
                        .trim()
                        .min(1, "Outcome cannot be empty")
                        .max(
                            MARKETING_LIMITS.COURSE.LEARNING_OUTCOME_MAX,
                            `Maximum ${MARKETING_LIMITS.COURSE.LEARNING_OUTCOME_MAX} characters allowed`
                        ),
                })
            )
            .max(
                MARKETING_LIMITS.COURSE.MAX_ITEMS,
                `Maximum ${MARKETING_LIMITS.COURSE.MAX_ITEMS} learning outcomes allowed`
            )
            .optional()
            .nullable(),

        target_audience: z
            .array(
                z.object({
                    value: z
                        .string()
                        .trim()
                        .min(1, "Audience entry cannot be empty")
                        .max(
                            MARKETING_LIMITS.COURSE.TARGET_AUDIENCE_MAX,
                            `Maximum ${MARKETING_LIMITS.COURSE.TARGET_AUDIENCE_MAX} characters allowed`
                        ),
                })
            )
            .max(
                MARKETING_LIMITS.COURSE.MAX_ITEMS,
                `Maximum ${MARKETING_LIMITS.COURSE.MAX_ITEMS} target audience entries allowed`
            )
            .optional()
            .nullable(),
    })
    /* ---------- Cross-field Validation ---------- */
    .superRefine((data, ctx) => {
        if (data.sale_price > data.list_price) {
            ctx.addIssue({
                code: "custom",
                message: "Sale price cannot be greater than list price",
                path: ["sale_price"],
            });
        }
    });
/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */

export type CourseFormValues = z.infer<typeof courseSchema>;
export type CourseDescription = z.infer<typeof descriptionSchema>;
