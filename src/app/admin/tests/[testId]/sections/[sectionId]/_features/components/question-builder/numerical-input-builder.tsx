"use client";

import { useState } from "react";
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

  const range: NumericRange =
    typeof value === "object" &&
    value !== null &&
    "target" in value &&
    "tolerance" in value
      ? (value as NumericRange)
      : {};

  const [targetInput, setTargetInput] = useState(
    range.target?.toString() ?? "",
  );

  const [toleranceInput, setToleranceInput] = useState(
    range.tolerance?.toString() ?? "",
  );

  function parse(raw: string): number | undefined {
    if (!raw.trim()) return undefined;

    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }

  function update(next: Partial<NumericRange>) {
    form.setValue(
      "correctAnswer",
      {
        target: "target" in next ? next.target : range.target,
        tolerance: "tolerance" in next ? next.tolerance : range.tolerance,
      },
      {
        shouldDirty: true,
        shouldTouch: true,
      },
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Correct Answer (With Tolerance)
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          step="any"
          value={targetInput}
          placeholder="1.53"
          onChange={(e) => {
            const raw = e.target.value;
            setTargetInput(raw);
            update({ target: parse(raw) });
          }}
        />

        <Input
          type="number"
          step="any"
          min="0"
          value={toleranceInput}
          placeholder="0.01"
          onChange={(e) => {
            const raw = e.target.value;
            setToleranceInput(raw);
            update({ tolerance: parse(raw) });
          }}
        />
      </div>
    </div>
  );
}
