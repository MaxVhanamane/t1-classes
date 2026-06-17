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
    <div className="space-y-4">
      {/* Question text (includes matrix table if match_matrix) */}
      <div className="text-sm font-medium w-fit">
        <RichTextHTMLContent content={question.questionText} />
      </div>

      {/* SINGLE SELECT + MATCH MATRIX (MCQ STYLE) */}
      {isMCQ && (
        <RadioGroup value={(value as string) ?? ""} onValueChange={onChange}>
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center space-x-2 rounded-md  p-2 py-0.5 hover:bg-muted/50"
            >
              <RadioGroupItem value={opt.id} id={opt.id} />
              <Label htmlFor={opt.id}>
                {opt.label}. <RichTextHTMLContent content={opt.text} />
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {/* MULTI SELECT */}
      {mode === "multi_select" && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const checked = Array.isArray(value) && value.includes(opt.id);

            return (
              <div
                key={opt.id}
                className="flex items-center space-x-2 rounded-md  p-2 hover:bg-muted/50"
              >
                <Checkbox
                  id={opt.id}
                  checked={checked}
                  onCheckedChange={() => toggleMulti(opt.id)}
                />
                <Label htmlFor={opt.id}>
                  {opt.label}. <RichTextHTMLContent content={opt.text} />
                </Label>
              </div>
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
