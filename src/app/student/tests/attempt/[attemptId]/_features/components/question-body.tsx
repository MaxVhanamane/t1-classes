"use client";

import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import {
  Question,
  Section,
} from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { RichTextHTMLContent } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-html-content";

type Props = {
  question: Question;
  section: Section;
  value: unknown | null;
  onChange: (value: unknown | null) => void;
};

export default function QuestionBody({
  question,
  section,
  value,
  onChange,
}: Props) {
  const mode = section.answerMode;

  // =========================
  // Helpers
  // =========================

  function toggleMulti(optionId: string) {
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];

    onChange(next);
  }

  const isMCQ = mode === "single_select" || mode === "match_matrix";

  // =========================
  // Render
  // =========================

  return (
    <div className="space-y-3">
      {/* Question text (includes matrix table if match_matrix) */}
      <div className="text-sm font-medium w-fit">
        <RichTextHTMLContent content={question.questionText} />
      </div>

      {/* SINGLE SELECT + MATCH MATRIX (MCQ STYLE) */}
      {isMCQ && (
        <RadioGroup value={(value as string) ?? ""} onValueChange={onChange}>
          {question.options.map((opt) => (
            <label
              key={opt.id}
              htmlFor={opt.id}
              className="flex items-start space-x-2 rounded-md p-2 py-0.5 hover:bg-muted/50 cursor-pointer"
            >
              <RadioGroupItem
                value={opt.id}
                id={opt.id}
                className="mt-1.5 shrink-0"
              />
              <div className="flex gap-1 text-sm pt-1">
                <span className="shrink-0">{opt.label}.</span>
                <div className="-mt-0.5">
                  <RichTextHTMLContent content={opt.text} />
                </div>
              </div>
            </label>
          ))}
        </RadioGroup>
      )}

      {/* MULTI SELECT */}
      {mode === "multi_select" && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const checked = Array.isArray(value) && value.includes(opt.id);
            return (
              <label
                key={opt.id}
                htmlFor={opt.id}
                className="flex items-start space-x-2 rounded-md p-2 hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  id={opt.id}
                  checked={checked}
                  onCheckedChange={() => toggleMulti(opt.id)}
                  className="mt-1.5 shrink-0"
                />
                <div className="flex gap-1 text-sm pt-1">
                  <span className="shrink-0">{opt.label}.</span>
                  <div className="-mt-0.5">
                    <RichTextHTMLContent content={opt.text} />
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* NUMERICAL INPUT */}
      {mode === "numerical_input" && (
        <div className="max-w-xs">
          <Label className="mb-1 block text-xs text-muted-foreground">
            Enter your answer
          </Label>
          <Input
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
