import { z } from "zod";

const matrixSchema = z.object({
  left: z.array(z.string().min(1)),
  right: z.array(z.string().min(1)),
});

/* --------------------------------------------
 * Option schema
 * ------------------------------------------*/
const optionSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(5)
    .regex(/^[A-Z]+$/, "Label must be uppercase letters (A, B, C...)"),

  text: z.string().min(1, "Option cannot be empty"),
});

/* --------------------------------------------
 * Main schema
 * ------------------------------------------*/
export const createQuestionSchema = z.object({
  // HTML string from rich editor
  questionText: z.string().min(10, "Question is too short"),

  explanation: z.string().nullable(),

  // Only required for MCQ + match matrix
  options: z.array(optionSchema).optional(),
  matrix: matrixSchema.optional(),
  /*
    Correct Answer Formats:
 
    single_select:
      "A"
 
    multi_select:
      ["A", "C"]
 
    numerical_input:
      "42"
 
    match_matrix:
      { "P": "B", "Q": "D" }
  */
  correctAnswer: z.union([
    z.string(),                          // single_select, numerical_input
    z.array(z.string()),               // multi_select
    z.record(z.string(), z.string()), // match_matrix
    z.object({
      target: z.number().optional(),
      tolerance: z.number().optional(),
    })
      .refine(
        (val) =>
          (val.target === undefined && val.tolerance === undefined) ||
          (val.target !== undefined && val.tolerance !== undefined),
        {
          message: "Both target and tolerance must be filled",
        }
      )
    // numerical input
  ]),
});

export type CreateQuestionInput = z.infer<
  typeof createQuestionSchema
>;
