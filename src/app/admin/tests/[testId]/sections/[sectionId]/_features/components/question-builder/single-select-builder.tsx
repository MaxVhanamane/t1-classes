"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CreateQuestionInput } from "../../zod/question.schema";

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
  const options = form.watch("options") ?? [];
  const correct = form.watch("correctAnswer") as string | undefined;

  const addOption = () => {
    const labels = options.map((o) => o.label);
    const label = nextLabel(labels);

    form.setValue("options", [...options, { label, text: "" }], {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const updateOption = (label: string, text: string) => {
    form.setValue(
      "options",
      options.map((o) => (o.label === label ? { ...o, text } : o)),
      { shouldDirty: true }
    );
  };

  const removeOption = (label: string) => {
    const next = options.filter((o) => o.label !== label);

    form.setValue("options", next, { shouldDirty: true });

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
    });
  };

  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <div key={opt.label} className="flex items-center gap-2">
          {/* Radio */}
          <input
            type="radio"
            name="correct-answer"
            checked={correct === opt.label}
            onChange={() => selectCorrect(opt.label)}
          />

          {/* Label */}
          <div className="w-6 text-sm font-medium text-muted-foreground">
            {opt.label}.
          </div>

          {/* Text */}
          <Input
            placeholder={`Option ${i + 1}`}
            value={opt.text}
            onChange={(e) => updateOption(opt.label, e.target.value)}
          />

          {/* Delete */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeOption(opt.label)}
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
