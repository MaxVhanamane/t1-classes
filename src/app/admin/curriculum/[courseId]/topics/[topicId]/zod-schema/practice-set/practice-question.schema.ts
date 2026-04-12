import { JSONContent } from "@tiptap/react";
import { z } from "zod";

/* -------------------------------------------------------
 * Utility: Extract Plain Text from TipTap JSON
 * ----------------------------------------------------- */
const extractTextFromNode = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";

    const n = node as {
        text?: string;
        content?: unknown[];
    };

    let text = "";

    if (typeof n.text === "string") {
        text += n.text;
    }

    if (Array.isArray(n.content)) {
        for (const child of n.content) {
            text += extractTextFromNode(child);
        }
    }

    return text;
};

/* -------------------------------------------------------
 * Utility: Check if Rich Text is Empty
 * ----------------------------------------------------- */
const isRichTextEmpty = (value: unknown): boolean => {
    if (!value) return true;

    const text = extractTextFromNode(value)
        .replace(/\u00A0/g, " ") // Replace non-breaking spaces
        .trim();

    return text.length === 0;
};

/* -------------------------------------------------------
 * Base TipTap JSON Schema
 * ----------------------------------------------------- */
export const baseJsonContentSchema = z.custom<JSONContent>(
    (value) => typeof value === "object" && value !== null,
    {
        message: "Invalid rich text content",
    }
);

/* -------------------------------------------------------
 * Required Rich Text Schema (Question & Options)
 * ----------------------------------------------------- */
export const requiredJsonContentSchema =
    baseJsonContentSchema.refine(
        (value) => !isRichTextEmpty(value),
        {
            message:
                "Content cannot be empty. Please enter meaningful text.",
        }
    );

/* -------------------------------------------------------
 * Optional Rich Text Schema (Explanation)
 * Converts empty content to null
 * NOTE: No `.optional()` to avoid `undefined`
 * ----------------------------------------------------- */
export const optionalJsonContentSchema =
    baseJsonContentSchema
        .nullable()
        .transform((value): JSONContent | null => {
            if (!value || isRichTextEmpty(value)) {
                return null;
            }
            return value;
        });

/* -------------------------------------------------------
 * Option Schema
 * ----------------------------------------------------- */
export const practiceOptionSchema = z.object({
    label: z
        .string()
        .min(1, "Option label is required")
        .max(5, "Option label is too long"),
    text: requiredJsonContentSchema,
});

/* -------------------------------------------------------
 * Base Practice Question Schema
 * ----------------------------------------------------- */
export const practiceQuestionBaseSchema = z
    .object({
        questionText: requiredJsonContentSchema,
        explanation: optionalJsonContentSchema,
        options: z
            .array(practiceOptionSchema)
            .min(2, "At least two options are required"),
        correctAnswer: z
            .string()
            .min(1, "Please select the correct answer"),
        answerMode: z.literal("single_select"),
    })
    .superRefine((data, ctx) => {
        const labels = data.options.map((opt) => opt.label);

        // Ensure the correct answer exists among options
        if (!labels.includes(data.correctAnswer)) {
            ctx.addIssue({
                code: "custom",
                path: ["correctAnswer"],
                message:
                    "Selected correct answer must match one of the options.",
            });
        }

        // Ensure option labels are unique
        const uniqueLabels = new Set(labels);
        if (uniqueLabels.size !== labels.length) {
            ctx.addIssue({
                code: "custom",
                path: ["options"],
                message: "Option labels must be unique.",
            });
        }
    });

/* -------------------------------------------------------
 * Create Practice Question Schema
 * ----------------------------------------------------- */
export const createPracticeQuestionSchema =
    practiceQuestionBaseSchema.extend({
        courseId: z.uuid(),
        topicId: z.uuid(),
        practiceSetId: z.uuid(),
    });

export type CreatePracticeQuestionInput = z.infer<
    typeof createPracticeQuestionSchema
>;

/* -------------------------------------------------------
 * Update Practice Question Schema
 * ----------------------------------------------------- */
export const updatePracticeQuestionSchema =
    practiceQuestionBaseSchema.extend({
        questionId: z.uuid(),
        courseId: z.uuid(),
        topicId: z.uuid(),
        practiceSetId: z.uuid(),
    });

export type UpdatePracticeQuestionInput = z.infer<
    typeof updatePracticeQuestionSchema
>;

/* -------------------------------------------------------
 * Delete Practice Question Schema
 * ----------------------------------------------------- */
export const deletePracticeQuestionSchema = z.object({
    courseId: z.uuid(),
    topicId: z.uuid(),
    practiceSetId: z.uuid(),
    questionId: z.uuid(),
});

export type DeletePracticeQuestionInput = z.infer<
    typeof deletePracticeQuestionSchema
>;
