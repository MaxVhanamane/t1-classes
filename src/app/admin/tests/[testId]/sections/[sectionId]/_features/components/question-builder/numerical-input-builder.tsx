"use client";

import { Input } from "@/src/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateQuestionInput } from "../../zod/question.schema";

interface Props {
  form: UseFormReturn<CreateQuestionInput>;
}

type NumericRange = {
  target?: number;
  tolerance?: number;
};

export function NumericalInputBuilder({ form }: Props) {
  const value = form.watch("correctAnswer");

  const range: NumericRange | undefined =
    typeof value === "object" &&
    value !== null &&
    "target" in value &&
    "tolerance" in value
      ? (value as NumericRange)
      : undefined;

  function update(next: Partial<NumericRange>) {
    const merged: NumericRange = {
      target: range?.target,
      tolerance: range?.tolerance,
      ...next,
    };

    // Prevent NaN pollution
    if (
      (merged.target !== undefined && Number.isNaN(merged.target)) ||
      (merged.tolerance !== undefined && Number.isNaN(merged.tolerance))
    ) {
      return;
    }

    form.setValue(
      "correctAnswer",
      merged as CreateQuestionInput["correctAnswer"],
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Correct Answer (With Tolerance)
      </label>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <Input
          type="number"
          step="any"
          placeholder="Target value (e.g. 9.8)"
          value={range?.target ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            update({
              target: raw === "" ? undefined : Number(raw),
            });
          }}
        />

        <Input
          type="number"
          step="any"
          min="0"
          placeholder="Tolerance (± range, e.g. 0.1)"
          value={range?.tolerance ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            update({
              tolerance: raw === "" ? undefined : Number(raw),
            });
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Student answers between{" "}
        <span className="font-medium">target ± tolerance</span> will be marked
        correct.
      </p>
    </div>
  );
}
