import { z } from "zod";

import {
    SUBJECTS,
    TARGET_EXAMS,
} from "../../../batches/_features/zod-schema/schema";

export const questionPaperCategorySchema =
    z.enum([
        "previous_year",
        "practice",
    ]);

export const questionPaperSchema =
    z
        .object({
            title: z
                .string()
                .trim()
                .min(
                    3,
                    "Title must be at least 3 characters",
                )
                .max(
                    200,
                    "Title must be less than 200 characters",
                ),
            description: z
                .string()
                .trim()
                .max(
                    2000,
                    "Description must be less than 2000 characters",
                )
                .nullable()
                .optional(),

            class_level: z
                .number()
                .int()
                .min(
                    6,
                    "Class level must be between 6 and 12",
                )
                .max(
                    12,
                    "Class level must be between 6 and 12",
                )
                .nullable()
                .optional(),
            target_exam:
                z
                    .enum(
                        TARGET_EXAMS,
                    )
                    .nullable(),

            subject:
                z
                    .enum(
                        SUBJECTS,
                    )
                    .nullable(),

            paper_category:
                questionPaperCategorySchema,

            years: z.array(
                z
                    .number()
                    .int()
                    .min(1900)
                    .max(3000),
            ),

            file_path: z.string(),

            file_size:
                z.number()
                    .int()
                    .positive()
                    .nullable()
                    .optional(),
        })
        .superRefine(
            (
                data,
                ctx,
            ) => {
                if (
                    data.paper_category ===
                    "previous_year" &&
                    data.years.length ===
                    0
                ) {
                    ctx.addIssue({
                        code:
                            z.ZodIssueCode.custom,
                        path: [
                            "years",
                        ],
                        message:
                            "Please add at least one year",
                    });
                }
            },
        );

export type QuestionPaperFormValues =
    z.infer<
        typeof questionPaperSchema
    >;
