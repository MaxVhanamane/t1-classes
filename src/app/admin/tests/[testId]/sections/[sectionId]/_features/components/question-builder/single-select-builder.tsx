"use client";
import { RichTextEditor } from "./rich-text-editor";
import { JSONContent } from "@tiptap/react";
import { Button } from "@/src/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreateQuestionInput } from "../../zod/question.schema";

const emptyDoc: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

interface Props {
  form: UseFormReturn<CreateQuestionInput>;
}

/* --------------------------------------------
 * Helpers
 * ------------------------------------------*/
function nextLabel(existing: string[]) {
  const charCode = 65 + existing.length; // A = 65
  return String.fromCharCode(charCode);
}

export function SingleSelectBuilder({ form }: Props) {
  const options =
    useWatch({
      control: form.control,
      name: "options",
    }) ?? [];

  const correct = useWatch({
    control: form.control,
    name: "correctAnswer",
  }) as string | undefined;

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

  const removeOption = (label: string) => {
    const currentOptions = form.getValues("options") ?? [];
    const next = currentOptions.filter((o) => o.label !== label);

    form.setValue("options", next, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (correct === label) {
      form.setValue("correctAnswer", "", {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  const selectCorrect = (label: string) => {
    form.setValue("correctAnswer", label, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <div
          key={opt.label}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          {/* Top controls (mobile) / Left controls (desktop) */}
          <div className="flex items-center justify-between sm:justify-start sm:gap-2 sm:w-auto">
            <div className="flex items-center gap-2">
              {/* Radio */}
              <input
                type="radio"
                name="correct-answer"
                checked={correct === opt.label}
                onChange={() => selectCorrect(opt.label)}
                className="h-4 w-4"
              />

              {/* Label */}
              <div className="text-sm font-medium text-muted-foreground sm:w-6">
                {opt.label}.
              </div>
            </div>

            {/* Delete (mobile) */}
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

          {/* Editor */}
          <div className="flex-1">
            <RichTextEditor
              value={opt.text ?? emptyDoc}
              onChange={(v) => updateOption(opt.label, v)}
              placeholder={`Option ${i + 1}`}
              size="sm"
              toolbar="option"
            />
          </div>

          {/* Delete (desktop) */}
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

      <Button type="button" variant="outline" onClick={addOption}>
        <Plus className="mr-2 h-4 w-4" />
        Add Option
      </Button>
    </div>
  );
}
