"use client";

import { JSONContent } from "@tiptap/react";
import { Button } from "@/src/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreatePracticeQuestionInput } from "../../zod-schema/practice-set/practice-question.schema";
import { RichTextEditor } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/question-builder/rich-text-editor";

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

/* --------------------------------------------
 * Types
 * ------------------------------------------*/
interface Props {
  form: UseFormReturn<CreatePracticeQuestionInput>;
}

/* --------------------------------------------
 * Helpers
 * ------------------------------------------*/
function nextLabel(existing: string[]) {
  const charCode = 65 + existing.length; // ASCII: A = 65
  return String.fromCharCode(charCode);
}

/* --------------------------------------------
 * Component
 * ------------------------------------------*/
export function SingleSelectPracticeBuilder({ form }: Props) {
  const options =
    useWatch({
      control: form.control,
      name: "options",
    }) ?? [];

  const correct = useWatch({
    control: form.control,
    name: "correctAnswer",
  });

  /* --------------------------------------------
   * Add Option
   * ------------------------------------------*/
  const addOption = () => {
    const currentOptions = form.getValues("options") ?? [];
    const labels = currentOptions.map((o) => o.label);
    const label = nextLabel(labels);

    form.setValue("options", [...currentOptions, { label, text: emptyDoc }], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  /* --------------------------------------------
   * Update Option
   * ------------------------------------------*/
  const updateOption = (label: string, text: JSONContent) => {
    const currentOptions = form.getValues("options") ?? [];

    const next = currentOptions.map((o) =>
      o.label === label ? { ...o, text } : o,
    );

    form.setValue("options", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /* --------------------------------------------
   * Remove Option
   * ------------------------------------------*/
  const removeOption = (label: string) => {
    const currentOptions = form.getValues("options") ?? [];
    const next = currentOptions.filter((o) => o.label !== label);

    form.setValue("options", next, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // Reset correct answer if deleted
    if (correct === label) {
      form.setValue("correctAnswer", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  };

  /* --------------------------------------------
   * Select Correct Answer
   * ------------------------------------------*/
  const selectCorrect = (label: string) => {
    form.setValue("correctAnswer", label, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  /* --------------------------------------------
   * Render
   * ------------------------------------------*/
  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <div
          key={opt.label}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          {/* Radio & Label */}
          <div className="flex items-center justify-between sm:justify-start sm:gap-2 sm:w-auto">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-answer"
                checked={correct === opt.label}
                onChange={() => selectCorrect(opt.label)}
                className="h-4 w-4"
              />

              <div className="text-sm font-medium text-muted-foreground sm:w-6">
                {opt.label}.
              </div>
            </div>

            {/* Delete Button (Mobile) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(opt.label)}
              className="sm:hidden"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Rich Text Editor */}
          <div className="flex-1">
            <RichTextEditor
              value={opt.text ?? emptyDoc}
              onChange={(v) => updateOption(opt.label, v)}
              placeholder={`Option ${i + 1}`}
              size="sm"
              toolbar="option"
            />
          </div>

          {/* Delete Button (Desktop) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeOption(opt.label)}
            className="hidden sm:flex"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Add Option Button */}
      <Button type="button" variant="outline" onClick={addOption}>
        <Plus className="mr-2 h-4 w-4" />
        Add Option
      </Button>
    </div>
  );
}
