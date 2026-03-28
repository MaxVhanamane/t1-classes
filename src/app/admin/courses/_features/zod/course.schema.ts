import { MARKETING_LIMITS } from "@/src/lib/constants/marketing-limits";
import { z } from "zod";

import {
    BOARDS,
    CATEGORIES,
    TARGET_EXAMS,
    SUBJECTS,
    LANGUAGES,
} from "../../../batches/_features/zod-schema/schema";

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

        /* -------------------------------------------------- */
        /* Category                                           */
        /* -------------------------------------------------- */

        category: z.enum(CATEGORIES, {
            message: "Please select a category",
        }),

        /* -------------------------------------------------- */
        /* Board (only for boards category)                   */
        /* -------------------------------------------------- */

        board: z.enum(BOARDS).nullable().optional(),

        /* -------------------------------------------------- */
        /* Academic metadata                                  */
        /* -------------------------------------------------- */

        class_level: z
            .coerce.number()
            .int()
            .min(6, "Class level must be between 6 and 12")
            .max(12, "Class level must be between 6 and 12")
            .nullable()
            .optional(),

        target_exam: z.enum(TARGET_EXAMS).nullable().optional(),

        subjects: z
            .array(
                z.object({
                    value: z.enum(SUBJECTS),
                })
            )
            .optional()
            .nullable(),

        /* -------------------------------------------------- */
        /* Pricing                                            */
        /* -------------------------------------------------- */

        list_price: z.coerce
            .number()
            .min(0, "List price cannot be negative"),

        sale_price: z.coerce
            .number()
            .min(0, "Sale price cannot be negative"),

        /* -------------------------------------------------- */
        /* Languages                                          */
        /* -------------------------------------------------- */

        languages: z
            .array(z.enum(LANGUAGES))
            .min(1, "At least one language is required"),

        /* -------------------------------------------------- */
        /* Instructors                                        */
        /* -------------------------------------------------- */

        instructor_ids: z.array(z.uuid()).optional(),

        is_active: z.boolean(),

        /* -------------------------------------------------- */
        /* Marketing Fields                                   */
        /* -------------------------------------------------- */

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
            .max(MARKETING_LIMITS.COURSE.MAX_ITEMS)
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
            .max(MARKETING_LIMITS.COURSE.MAX_ITEMS)
            .optional()
            .nullable(),
    })

    /* -------------------------------------------------- */
    /* Cross-field validation                             */
    /* -------------------------------------------------- */

    .superRefine((data, ctx) => {
        if (data.sale_price > data.list_price) {
            ctx.addIssue({
                code: "custom",
                message: "Sale price cannot be greater than list price",
                path: ["sale_price"],
            });
        }

        if (data.category === "boards" && !data.board) {
            ctx.addIssue({
                code: "custom",
                message: "Board is required for board category",
                path: ["board"],
            });
        }

        if (data.category === "boards" && data.target_exam) {
            ctx.addIssue({
                code: "custom",
                message: "Target exam is not allowed for boards category",
                path: ["target_exam"],
            });
        }
    });

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */

export type CourseFormValues = z.infer<typeof courseSchema>;
export type CourseDescription = z.infer<typeof descriptionSchema>;
