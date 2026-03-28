"use client";

import { RichTextEditor } from "./rich-text-editor";
import { JSONContent } from "@tiptap/react";
import { Button } from "@/src/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreateQuestionInput } from "../../zod/question.schema";

/* -------------------------------------------- */
const emptyDoc: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/* -------------------------------------------- */
function nextLabel(existing: string[]) {
  const charCode = 65 + existing.length;
  return String.fromCharCode(charCode);
}

interface Props {
  form: UseFormReturn<CreateQuestionInput>;
}

export function MultiSelectBuilder({ form }: Props) {
  const options =
    useWatch({
      control: form.control,
      name: "options",
    }) ?? [];

  const correct =
    (useWatch({
      control: form.control,
      name: "correctAnswer",
    }) as string[]) ?? [];

  /* -------------------------------------------- */
  const addOption = () => {
    const labels = options.map((o) => o.label);
    const label = nextLabel(labels);

    form.setValue("options", [...options, { label, text: emptyDoc }], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  /* -------------------------------------------- */
  const updateOption = (label: string, text: JSONContent) => {
    const next = options.map((o) => (o.label === label ? { ...o, text } : o));

    form.setValue("options", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /* -------------------------------------------- */
  const toggleCorrect = (label: string) => {
    const next = new Set(correct);

    if (next.has(label)) next.delete(label);
    else next.add(label);

    form.setValue("correctAnswer", Array.from(next), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  /* -------------------------------------------- */
  const removeOption = (label: string) => {
    const nextOptions = options.filter((o) => o.label !== label);
    const nextCorrect = correct.filter((l) => l !== label);

    form.setValue("options", nextOptions, {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.setValue("correctAnswer", nextCorrect, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /* -------------------------------------------- */
  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <div
          key={opt.label}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          {/* Controls */}
          <div className="flex items-center justify-between sm:gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={correct.includes(opt.label)}
                onChange={() => toggleCorrect(opt.label)}
                className="h-4 w-4"
              />

              <div className="text-sm font-medium text-muted-foreground sm:w-6">
                {opt.label}.
              </div>
            </div>

            {/* Mobile delete */}
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

          {/* Rich text editor */}
          <div className="flex-1">
            <RichTextEditor
              value={opt.text ?? emptyDoc}
              onChange={(v) => updateOption(opt.label, v)}
              placeholder={`Option ${i + 1}`}
              size="sm"
              toolbar="option"
            />
          </div>

          {/* Desktop delete */}
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
