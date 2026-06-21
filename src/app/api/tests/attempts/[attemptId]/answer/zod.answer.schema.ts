import { z } from "zod";

export const SingleAnswerSchema = z.object({
    option_id: z.uuid(),
});

export const MultiAnswerSchema = z.object({
    option_ids: z.array(z.uuid()).min(1),
});

export const NumericAnswerSchema = z.object({
    value: z.number(),
});

export const AnswerSchema = z.union([
    SingleAnswerSchema,
    MultiAnswerSchema,
    NumericAnswerSchema,
    z.null(),
]);

export const SaveAnswerSchema = z.object({
    questionId: z.uuid(),
    answer: AnswerSchema,
    markedForReview: z.boolean().optional(),

    timeSpentSeconds: z
        .number()
        .int()
        .min(0),
});

export type SaveAnswerBody = z.infer<
    typeof SaveAnswerSchema
>;
