"use client";

import { useEffect, useState } from "react";
import { FieldError, FieldErrors, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

import { RichTextEditor } from "./rich-text-editor";
import {
  createQuestionSchema,
  CreateQuestionInput,
  isEditorEmpty,
} from "../../zod/question.schema";

import { TestSection } from "../../types/section.types";
import { TestQuestion } from "../../types/question.types";
import { CorrectAnswer } from "../../types/correct-answer.types";

import { upsertQuestion } from "../../actions/upsert-question";

import { SingleSelectBuilder } from "./single-select-builder";
import { MultiSelectBuilder } from "./multi-select-builder";
import { NumericalInputBuilder } from "./numerical-input-builder";
import { MatchMatrixBuilder } from "./match-matrix-builder";
import { JSONContent } from "@tiptap/react";
import { useQueryClient } from "@tanstack/react-query";
import { callServerAction } from "@/src/lib/actions/call-server-action";
/* --------------------------------------------
 * Types
 * ------------------------------------------*/
type OptionForm = {
  label: string;
  text: JSONContent;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  section: TestSection;
  editingQuestion: TestQuestion | null;
}

const emptyDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};
/* --------------------------------------------
 * Defaults
 * ------------------------------------------*/
function createDefaultOptions(
  mode: TestSection["answerMode"],
): OptionForm[] | undefined {
  if (mode === "single_select" || mode === "multi_select") {
    return [
      { label: "A", text: emptyDoc },
      { label: "B", text: emptyDoc },
      { label: "C", text: emptyDoc },
      { label: "D", text: emptyDoc },
    ];
  }
  return undefined;
}

function isNumericRange(
  value: unknown,
): value is { target?: number; tolerance?: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "target" in value &&
    "tolerance" in value &&
    (typeof (value as { target?: unknown }).target === "number" ||
      (value as { target?: unknown }).target === undefined) &&
    (typeof (value as { tolerance?: unknown }).tolerance === "number" ||
      (value as { tolerance?: unknown }).tolerance === undefined)
  );
}

function createDefaultCorrectAnswer(
  mode: TestSection["answerMode"],
): CreateQuestionInput["correctAnswer"] {
  switch (mode) {
    case "multi_select":
      return [];
    case "match_matrix":
      return {};
    case "numerical_input":
      return { target: undefined, tolerance: undefined };
    default:
      return "";
  }
}

/* --------------------------------------------
 * DB → Form Mapper
 * DB stores UUIDs
 * UI works with labels
 * ------------------------------------------*/
function mapCorrectAnswerToForm(
  mode: TestSection["answerMode"],
  answer: CorrectAnswer | null,
  options?: { id: string; label: string }[],
): CreateQuestionInput["correctAnswer"] {
  if (!answer) {
    return createDefaultCorrectAnswer(mode);
  }

  switch (mode) {
    case "single_select": {
      if (!("option_id" in answer) || !options) return "";
      return options.find((o) => o.id === answer.option_id)?.label ?? "";
    }

    case "multi_select": {
      if (!("option_ids" in answer) || !options) return [];
      return options
        .filter((o) => answer.option_ids.includes(o.id))
        .map((o) => o.label);
    }

    case "match_matrix": {
      if (!("matches" in answer) || !options) return {};

      const raw = answer.matches;

      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        return {};
      }

      const result: Record<string, string> = {};
      const matches = raw as Record<string, string>;

      for (const [left, id] of Object.entries(matches)) {
        const match = options.find((o) => o.id === id);
        if (match) {
          result[left] = match.label;
        }
      }

      return result;
    }

    case "numerical_input": {
      if (
        typeof answer === "object" &&
        answer !== null &&
        "target" in answer &&
        "tolerance" in answer &&
        typeof answer.target === "number" &&
        typeof answer.tolerance === "number"
      ) {
        return {
          target: answer.target,
          tolerance: answer.tolerance,
        };
      }

      return {
        target: undefined,
        tolerance: undefined,
      };
    }

    default:
      return "";
  }
}

/* --------------------------------------------
 * Sanitize Correct Answer
 * Removes stale labels when options change
 * ------------------------------------------*/
function sanitizeCorrectAnswer(
  mode: TestSection["answerMode"],
  value: CreateQuestionInput["correctAnswer"],
  options?: { label: string }[],
): CreateQuestionInput["correctAnswer"] {
  if (!options) return value;

  switch (mode) {
    case "single_select":
      return options.some((o) => o.label === value) ? value : "";

    case "multi_select":
      return Array.isArray(value)
        ? value.filter((label) => options.some((o) => o.label === label))
        : [];

    case "match_matrix": {
      if (typeof value !== "object" || value === null) return {};
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(value)) {
        if (options.some((o) => o.label === v)) {
          result[k] = v;
        }
      }
      return result;
    }

    default:
      return value;
  }
}

/* --------------------------------------------
 * Validation Helper
 * ------------------------------------------*/
function hasValidCorrectAnswer(
  mode: TestSection["answerMode"],
  value: CreateQuestionInput["correctAnswer"],
): boolean {
  switch (mode) {
    case "single_select":
      return typeof value === "string" && value.length > 0;

    case "multi_select":
      return Array.isArray(value) && value.length > 0;
    case "numerical_input":
      return (
        isNumericRange(value) &&
        typeof value.target === "number" &&
        typeof value.tolerance === "number"
      );

    case "match_matrix":
      return typeof value === "string" && value.length > 0;

    default:
      return false;
  }
}

/* --------------------------------------------
 * Component
 * ------------------------------------------*/
export function QuestionBuilderDialog({
  open,
  onOpenChange,
  section,
  editingQuestion,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      questionText: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [],
          },
        ],
      },
      explanation: emptyDoc,
      options: createDefaultOptions(section.answerMode),
      correctAnswer: createDefaultCorrectAnswer(section.answerMode),
    },
  });

  const questionText = useWatch({
    control: form.control,
    name: "questionText",
  });

  const explanation = useWatch({
    control: form.control,
    name: "explanation",
  });
  /* --------------------------------------------
   * Load / Reset Form
   * ------------------------------------------*/
  useEffect(() => {
    if (!open) return;

    if (editingQuestion) {
      const mapped = mapCorrectAnswerToForm(
        section.answerMode,
        editingQuestion.correctAnswer,
        editingQuestion.options,
      );

      form.reset({
        questionText: editingQuestion.questionText,
        explanation: editingQuestion.explanation,
        options:
          editingQuestion.options?.map((o) => ({
            label: o.label,
            text: o.text,
          })) ?? createDefaultOptions(section.answerMode),
        correctAnswer: sanitizeCorrectAnswer(
          section.answerMode,
          mapped,
          editingQuestion.options,
        ),
      });
    } else {
      form.reset({
        questionText: emptyDoc,
        explanation: emptyDoc,
        options: createDefaultOptions(section.answerMode),
        correctAnswer: createDefaultCorrectAnswer(section.answerMode),
      });
    }
  }, [open, editingQuestion, section.answerMode, form]);

  /* --------------------------------------------
   * Submit
   * ------------------------------------------*/

  const handleSubmit = async (values: CreateQuestionInput) => {
    if (!hasValidCorrectAnswer(section.answerMode, values.correctAnswer)) {
      toast.error("Please select or enter the correct answer before saving.");
      return;
    }

    const payload = {
      ...values,
      explanation: isEditorEmpty(values.explanation)
        ? null
        : values.explanation,
    };

    const finalValues = JSON.stringify(payload);

    setSubmitting(true);

    const toastId = toast.loading(
      editingQuestion ? "Updating question..." : "Saving question...",
    );

    const { error } = await callServerAction(
      upsertQuestion(
        section.testId,
        section.id,
        finalValues,
        editingQuestion?.id,
      ),
    );

    if (error) {
      toast.error(error, { id: toastId });
      setSubmitting(false);
      return;
    }

    toast.success(editingQuestion ? "Question updated" : "Question added", {
      id: toastId,
    });

    await queryClient.invalidateQueries({
      queryKey: ["section-questions", section.id],
    });

    onOpenChange(false);
    setSubmitting(false);
  };

  /* --------------------------------------------
   * Render
   * ------------------------------------------*/
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className=" backdrop-blur-lg" />
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-4xl overflow-y-auto h-[90vh] bg-background p-2 py-8 md:py-auto md:p-6 "
      >
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "Edit Question" : "Add Question"} —{" "}
            {section.title}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(
            handleSubmit,
            (errors: FieldErrors<CreateQuestionInput>) => {
              const messages: string[] = [];

              const extractErrors = (
                obj: FieldErrors<CreateQuestionInput> | FieldError | unknown,
              ) => {
                if (!obj || typeof obj !== "object") return;

                if ("message" in obj && typeof obj.message === "string") {
                  messages.push(obj.message);
                }

                Object.values(obj).forEach((val) => {
                  if (typeof val === "object" && val !== null) {
                    extractErrors(val as FieldErrors<CreateQuestionInput>);
                  }
                });
              };

              extractErrors(errors);

              if (messages.length > 0) {
                toast.error(messages[0]);
              } else {
                toast.error("Form validation failed.");
              }
            },
          )}
          className="space-y-6"
        >
          {/* Question */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Question</label>
            <RichTextEditor
              value={questionText}
              onChange={(v) =>
                form.setValue("questionText", v, { shouldDirty: true })
              }
              placeholder="Write the full question here. You can add images, formulas, or lists."
            />
          </div>

          {/* Mode Info */}
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <span className="font-medium">Answer Mode:</span>{" "}
            {section.answerMode.replace("_", " ")}
            <p className="mt-1 text-muted-foreground">
              Configure answer options and correct responses below.
            </p>
          </div>

          {/* Builders */}
          {section.answerMode === "single_select" && (
            <SingleSelectBuilder form={form} />
          )}
          {section.answerMode === "multi_select" && (
            <MultiSelectBuilder form={form} />
          )}
          {section.answerMode === "numerical_input" && (
            <NumericalInputBuilder form={form} />
          )}
          {section.answerMode === "match_matrix" && (
            <MatchMatrixBuilder form={form} questionText={questionText} />
          )}

          {/* Explanation */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Explanation (Optional)
            </label>
            <RichTextEditor
              value={explanation ?? emptyDoc}
              onChange={(v) =>
                form.setValue("explanation", v, { shouldDirty: true })
              }
              placeholder="Explain why this answer is correct (shown after test submission)"
              toolbar="explanation"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {editingQuestion ? "Update Question" : "Save Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
