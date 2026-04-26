import { z } from "zod";

/* -------------------------------------------- *
 * Helpers
 * ------------------------------------------*/

function extractTextLength(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const n = node as Record<string, unknown>;
  let length = 0;

  // Count text nodes
  if (typeof n.text === "string") {
    length += n.text.trim().length;
  }

  // Count math nodes by their latex content
  if (
    (n.type === "inlineMath" || n.type === "blockMath") &&
    typeof n.attrs === "object" &&
    n.attrs !== null
  ) {
    const attrs = n.attrs as Record<string, unknown>;
    if (typeof attrs.latex === "string") {
      length += attrs.latex.trim().length;
    }
  }

  // Count table and image nodes as having content
  if (n.type === "table" || n.type === "image") {
    length += 10;
  }

  // Recurse into children
  if (Array.isArray(n.content)) {
    for (const child of n.content) {
      length += extractTextLength(child);
    }
  }

  return length;
}

export function isEditorEmpty(node: unknown): boolean {
  return extractTextLength(node) === 0;
}
/* -------------------------------------------- *
 * Matrix schema
 * ------------------------------------------*/

const matrixSchema = z.object({
  left: z.array(z.string().min(1)),
  right: z.array(z.string().min(1)),
});

/* -------------------------------------------- *
 * Option schema (rich editor JSON)
 * ------------------------------------------*/

const optionSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(5)
    .regex(/^[A-Z]+$/, "Label must be uppercase letters (A, B, C...)"),

  text: z
    .any()
    .refine(
      (val) => extractTextLength(val) > 0,
      "Option cannot be empty",
    ),
});

/* -------------------------------------------- *
 * Question text validation
 * ------------------------------------------*/

const questionTextSchema = z.any().refine(
  (val) => extractTextLength(val) >= 5,
  "Question is too short",
);

const explanationSchema = z
  .any()
  .nullable()
  .transform((val) => (isEditorEmpty(val) ? null : val));

/* -------------------------------------------- *
 * Main schema
 * ------------------------------------------*/

export const createQuestionSchema = z.object({
  questionText: questionTextSchema,

  explanation: explanationSchema,

  options: z.array(optionSchema).optional(),

  matrix: matrixSchema.optional(),

  /* --------------------------------------------
   Correct Answer Formats
   --------------------------------------------

   single_select   -> "A"
   multi_select    -> ["A", "C"]
   numerical_input -> { target, tolerance }
   match_matrix    -> { "P": "B", "Q": "D" }

  -------------------------------------------- */

  correctAnswer: z.union([
    z.string(),                    // single_select
    z.array(z.string()),           // multi_select

    z
      .object({
        target: z.number().optional(),
        tolerance: z.number().optional(),
      })
      .refine(
        (val) =>
          (val.target === undefined &&
            val.tolerance === undefined) ||
          (val.target !== undefined &&
            val.tolerance !== undefined),
        {
          message: "Both target and tolerance must be filled",
        },
      ),
    z.record(z.string(), z.string()), // match_matrix
  ]),

});

/* -------------------------------------------- *
 * Type
 * ------------------------------------------*/

export type CreateQuestionInput = z.infer<
  typeof createQuestionSchema
>;
