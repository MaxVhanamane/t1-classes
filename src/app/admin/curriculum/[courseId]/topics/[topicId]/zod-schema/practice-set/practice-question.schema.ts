import { z } from "zod";

export const createPracticeQuestionWithOptionsSchema = z.object({
    courseId: z.uuid(),
    topicId: z.uuid(),
    practiceSetId: z.uuid(),
    question: z.string().min(1, "Question is required"),
    correct_answer_explanation: z.string().nullable(),

    options: z
        .array(
            z.object({
                option_text: z.string().min(1, "Option text is required"),
                is_correct: z.boolean(),
            })
        )
        .min(2, "At least two options are required"),
});

export type CreatePracticeQuestionWithOptionsInput = z.infer<
    typeof createPracticeQuestionWithOptionsSchema
>;

export const updatePracticeQuestionWithOptionsSchema = z.object({
    courseId: z.uuid(),
    topicId: z.uuid(),
    practiceSetId: z.uuid(),
    questionId: z.uuid(),

    question: z.string().min(1, "Question is required"),
    correct_answer_explanation: z.string().nullable(),

    options: z
        .array(
            z.object({
                option_text: z.string().min(1, "Option text is required"),
                is_correct: z.boolean(),
            })
        )
        .min(2, "At least two options are required"),
});

export type UpdatePracticeQuestionWithOptionsInput = z.infer<
    typeof updatePracticeQuestionWithOptionsSchema
>;


export const deletePracticeQuestionSchema = z.object({
    courseId: z.uuid(),
    topicId: z.uuid(),
    practiceSetId: z.uuid(),
    questionId: z.uuid(),
});

export type DeletePracticeQuestionInput = z.infer<
    typeof deletePracticeQuestionSchema
>;
