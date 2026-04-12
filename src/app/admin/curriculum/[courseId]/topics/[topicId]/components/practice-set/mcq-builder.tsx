"use client";

import { useEffect, useState } from "react";
import { useForm, FieldErrors, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JSONContent } from "@tiptap/react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

import { RichTextEditor } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/question-builder/rich-text-editor";

import {
  CreatePracticeQuestionInput,
  createPracticeQuestionSchema,
  UpdatePracticeQuestionInput,
} from "../../zod-schema/practice-set/practice-question.schema";
import { SingleSelectPracticeBuilder } from "./single-select-practice-builder";
import { updatePracticeQuestion } from "../../practice/[practiceSetId]/actions/practice-set/update-practice-question-with-options";
import { createPracticeQuestion } from "../../practice/[practiceSetId]/actions/practice-set/create-practice-question-with-options";
import { normalizeRichText } from "@/src/lib/rich-text/rich-text-utils";

/* --------------------------------------------
 * Types
 * ------------------------------------------*/
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  topicId: string;
  practiceSetId: string;
  editingQuestion?: {
    id: string;
    questionText: JSONContent;
    explanation?: JSONContent | null;
    options: {
      id: string;
      label: string;
      text: JSONContent;
      isCorrect: boolean;
    }[];
  } | null;
}

/* --------------------------------------------
 * Constants
 * ------------------------------------------*/
const emptyDoc: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

const defaultOptions = [
  { label: "A", text: emptyDoc },
  { label: "B", text: emptyDoc },
  { label: "C", text: emptyDoc },
  { label: "D", text: emptyDoc },
];

/* --------------------------------------------
 * Component
 * ------------------------------------------*/
export function PracticeMcqBuilderDialog({
  open,
  onOpenChange,
  courseId,
  topicId,
  practiceSetId,
  editingQuestion = null,
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreatePracticeQuestionInput>({
    resolver: zodResolver(createPracticeQuestionSchema),
    defaultValues: {
      courseId,
      topicId,
      practiceSetId,
      questionText: emptyDoc,
      explanation: emptyDoc,
      options: defaultOptions,
      correctAnswer: "",
      answerMode: "single_select",
    },
  });

  /* --------------------------------------------
   * Load Data for Editing
   * ------------------------------------------*/
  useEffect(() => {
    if (!open) return;

    if (editingQuestion) {
      const correctOption = editingQuestion.options.find((o) => o.isCorrect);

      form.reset({
        courseId,
        topicId,
        practiceSetId,
        questionText: editingQuestion.questionText,
        explanation: editingQuestion.explanation ?? emptyDoc,
        options: editingQuestion.options.map((o) => ({
          label: o.label,
          text: o.text,
        })),
        correctAnswer: correctOption?.label ?? "",
        answerMode: "single_select",
      });
    } else {
      form.reset({
        courseId,
        topicId,
        practiceSetId,
        questionText: emptyDoc,
        explanation: emptyDoc,
        options: defaultOptions,
        correctAnswer: "",
        answerMode: "single_select",
      });
    }
  }, [open, editingQuestion, form, courseId, topicId, practiceSetId]);

  /* --------------------------------------------
   * Submit Handler
   * ------------------------------------------*/
  const handleSubmit = async (values: CreatePracticeQuestionInput) => {
    setSubmitting(true);

    const toastId = toast.loading(
      editingQuestion ? "Updating question..." : "Saving question...",
    );

    try {
      // Normalize optional fields
      // normalizeRichText converts explanation to null if empty
      const normalizedValues = {
        ...values,
        explanation: normalizeRichText(values.explanation),
      };

      if (editingQuestion) {
        const updatePayload: UpdatePracticeQuestionInput = {
          ...normalizedValues,
          questionId: editingQuestion.id,
          courseId,
          topicId,
          practiceSetId,
          answerMode: "single_select",
        };

        await updatePracticeQuestion(updatePayload);
      } else {
        const createPayload: CreatePracticeQuestionInput = {
          ...normalizedValues,
          courseId,
          topicId,
          practiceSetId,
          answerMode: "single_select",
        };

        await createPracticeQuestion(createPayload);
      }

      toast.success(
        editingQuestion
          ? "Question updated successfully"
          : "Question created successfully",
        { id: toastId },
      );

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save question", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };
  /* --------------------------------------------
   * Render
   * ------------------------------------------*/
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="backdrop-blur-lg" />
      <DialogContent
        className="sm:max-w-4xl h-[90vh] overflow-y-auto bg-background"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingQuestion
              ? "Edit Practice Question"
              : "Add Practice Question"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(
            handleSubmit,
            (errors: FieldErrors<CreatePracticeQuestionInput>) => {
              const messages: string[] = [];

              const extractErrors = (
                obj:
                  | FieldErrors<CreatePracticeQuestionInput>
                  | FieldError
                  | unknown,
              ) => {
                if (!obj || typeof obj !== "object") return;

                if ("message" in obj && typeof obj.message === "string") {
                  messages.push(obj.message);
                }

                Object.values(obj).forEach((val) => {
                  if (typeof val === "object" && val !== null) {
                    extractErrors(val);
                  }
                });
              };

              extractErrors(errors);
              toast.error(messages[0] || "Form validation failed.");
            },
          )}
          className="space-y-6"
        >
          {/* Question */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <RichTextEditor
              value={form.watch("questionText")}
              onChange={(v) =>
                form.setValue("questionText", v, {
                  shouldDirty: true,
                })
              }
              placeholder="Write the question. You can add images, formulas, and formatting."
            />
          </div>

          {/* Single Select Builder */}
          <SingleSelectPracticeBuilder form={form} />

          {/* Explanation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Explanation (Optional)
            </label>
            <RichTextEditor
              value={form.watch("explanation") ?? emptyDoc}
              onChange={(v) =>
                form.setValue("explanation", v, {
                  shouldDirty: true,
                })
              }
              toolbar="explanation"
              placeholder="Explain why this answer is correct."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
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
