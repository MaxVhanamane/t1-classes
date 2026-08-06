"use client";

import { useState } from "react"; // <-- ADDED useState
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

// --- ADDED SHADCN DIALOG IMPORTS ---
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";

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
  // State: Lightbox
  // =========================
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

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

  // EVENT DELEGATION: Catch clicks on any image inside the question/options
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      // Prevent the click from accidentally selecting a radio button if the image is inside an option label
      e.preventDefault();
      setFullScreenImage((target as HTMLImageElement).src);
    }
  };

  const isMCQ = mode === "single_select" || mode === "match_matrix";

  // =========================
  // Render
  // =========================

  return (
    <>
      {/* ATTACHED onClick={handleImageClick} HERE */}
      <div className="space-y-3" onClick={handleImageClick}>
        {/* Question text (includes matrix table if match_matrix) */}
        <div className="text-sm font-medium w-fit min-w-0">
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
                <div className="flex gap-1 text-sm pt-1 min-w-0 flex-1">
                  <span className="shrink-0">{opt.label}.</span>
                  <div className="-mt-0.5 min-w-0 flex-1">
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
                  <div className="flex gap-1 text-sm pt-1 min-w-0 flex-1">
                    <span className="shrink-0">{opt.label}.</span>
                    <div className="-mt-0.5 min-w-0 flex-1">
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
          <div className="max-w-xs space-y-1">
            <Label className="mb-1 block text-xs text-muted-foreground">
              Enter your answer
            </Label>
            <Input
              type="number"
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="ml-0.5"
            />
          </div>
        )}
      </div>

      {/* --- LIGHTBOX DIALOG --- */}
      <Dialog
        open={!!fullScreenImage}
        onOpenChange={(open) => !open && setFullScreenImage(null)}
      >
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] bg-black/90 border-none shadow-none p-0 flex justify-center items-center">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>

          {fullScreenImage && (
            <img
              src={fullScreenImage}
              className="w-full h-full object-contain p-4"
              alt="Fullscreen preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
