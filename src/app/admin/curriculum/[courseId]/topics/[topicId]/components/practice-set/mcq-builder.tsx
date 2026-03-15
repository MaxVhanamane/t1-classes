"use client";

import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Trash2, Pencil, PlusSquare } from "lucide-react";
import { updatePracticeQuestionWithOptions } from "../../actions/practice-set/update-practice-question-with-options";
import { createPracticeQuestionWithOptions } from "../../actions/practice-set/create-practice-question-with-options";

interface Props {
  courseId: string;
  topicId: string;
  practiceSetId: string;
  mode?: "create" | "edit";
  initialData?: {
    questionId: string;
    question: string;
    correct_answer_explanation: string | null;
    options: {
      id: string;
      option_text: string;
      is_correct: boolean;
    }[];
  };
  onCancel?: () => void;
}

type DraftOption = {
  id: string;
  option_text: string;
};

export function McqBuilder({
  courseId,
  topicId,
  practiceSetId,
  mode = "create",
  initialData,
  onCancel,
}: Props) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const editRef = useRef<HTMLTextAreaElement | null>(null);

  /* preload edit */
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setQuestion(initialData.question);
      setExplanation(initialData.correct_answer_explanation ?? "");
      setOptions(
        initialData.options.map((o) => ({
          id: o.id,
          option_text: o.option_text,
        })),
      );
      const correct = initialData.options.find((o) => o.is_correct);
      setCorrectOptionId(correct?.id ?? null);
    }
  }, [mode, initialData]);

  useEffect(() => {
    if (editingOptionId && editRef.current) {
      const el = editRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editingOptionId]);

  function isDuplicate(value: string, excludeId?: string) {
    return options.some(
      (o) =>
        o.id !== excludeId &&
        o.option_text.toLowerCase() === value.toLowerCase(),
    );
  }

  function addEmptyOption() {
    const id = nanoid();
    setOptions((prev) => [...prev, { id, option_text: "" }]);
    setEditingOptionId(id);
    setEditingText("");
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
    if (correctOptionId === id) setCorrectOptionId(null);
  }

  function saveEdit(optionId: string) {
    const value = editingText.trim();

    if (!value) {
      removeOption(optionId);
      setEditingOptionId(null);
      return;
    }

    if (isDuplicate(value, optionId)) {
      toast.error("Duplicate option");
      return;
    }

    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, option_text: value } : o)),
    );

    setEditingOptionId(null);
  }

  async function handleSave() {
    if (saving) return;

    if (!question.trim()) {
      toast.error("Question is required");
      return;
    }

    const validOptions = options.filter((o) => o.option_text.trim());

    if (validOptions.length < 2) {
      toast.error("Add at least two options");
      return;
    }

    if (!correctOptionId) {
      toast.error("Select the correct answer");
      return;
    }

    setSaving(true);

    const basePayload = {
      courseId,
      topicId,
      practiceSetId,
      question,
      correct_answer_explanation: explanation || null,
      options: validOptions.map((o) => ({
        option_text: o.option_text,
        is_correct: o.id === correctOptionId,
      })),
    };

    try {
      if (mode === "edit") {
        await updatePracticeQuestionWithOptions({
          ...basePayload,
          questionId: initialData!.questionId,
        });
        toast.success("Question updated");
        onCancel?.();
      } else {
        await createPracticeQuestionWithOptions(basePayload);
        toast.success("Question added");

        setQuestion("");
        setOptions([]);
        setCorrectOptionId(null);
        setExplanation("");
      }
    } catch {
      toast.error("Failed to save question");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-md border p-4">
      {/* Question */}
      <div className="space-y-2">
        <Label>Question</Label>
        <Textarea
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <Separator />

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Options</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addEmptyOption}
            disabled={!question.trim()}
          >
            + Add option
          </Button>
        </div>

        <RadioGroup
          value={correctOptionId ?? ""}
          onValueChange={setCorrectOptionId}
          className="space-y-2"
        >
          {options.map((option) => {
            const isCorrect = option.id === correctOptionId;
            const isEditing = option.id === editingOptionId;

            return (
              <div
                key={option.id}
                onClick={() => setCorrectOptionId(option.id)}
                className={`relative flex items-center gap-3 rounded-md p-3 border cursor-pointer
                  ${
                    isCorrect
                      ? "border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/10"
                      : "hover:bg-muted"
                  }`}
              >
                {isCorrect && !isEditing && (
                  <span className="absolute -top-2 right-3 rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] text-white">
                    Correct
                  </span>
                )}

                <RadioGroupItem value={option.id} />

                <div className="flex-1">
                  {isEditing ? (
                    <Textarea
                      ref={editRef}
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => saveEdit(option.id)}
                    />
                  ) : (
                    <p className="text-sm">
                      {option.option_text || (
                        <span className="text-muted-foreground italic">
                          Empty option
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div
                  className="flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingOptionId(option.id);
                      setEditingText(option.option_text);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button size="icon" variant="ghost" onClick={addEmptyOption}>
                    <PlusSquare className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => removeOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {correctOptionId && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label>Correct answer explanation</Label>
            <Textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>
        </>
      )}

      <Separator />

      <div className="flex justify-end gap-2">
        {mode === "edit" && onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button onClick={handleSave} disabled={saving} className="min-w-32">
          {saving
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Save question"}
        </Button>
      </div>
    </div>
  );
}
