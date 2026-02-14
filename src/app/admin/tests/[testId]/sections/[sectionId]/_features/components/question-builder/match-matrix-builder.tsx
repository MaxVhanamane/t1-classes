"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateQuestionInput } from "../../zod/question.schema";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

/* ---------------- Types ---------------- */
interface Props {
  form: UseFormReturn<CreateQuestionInput>;
}

type Mapping = Record<string, string>;

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

/* ---------------- Helpers ---------------- */
function makeLeft(i: number) {
  return `(${String.fromCharCode(80 + i)})`; // (P)(Q)(R)...
}

function makeRight(i: number) {
  return `(${i + 1})`; // (1)(2)(3)...
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Extract only "(P)" from "(P) Velocity"
function extractToken(value: string) {
  const match = value.match(/^\([^)]+\)/);
  return match ? match[0] : value;
}

// OPTIONS preview formatting ONLY
function formatMapping(map: Mapping) {
  return Object.entries(map)
    .map(([l, r]) => `${extractToken(l)} → ${extractToken(r)}`)
    .join(", ");
}

function generateWrongMappings(
  correct: Mapping,
  right: string[],
  count: number
): Mapping[] {
  const results: Mapping[] = [];
  const seen = new Set<string>();

  const correctKey = JSON.stringify(correct);
  seen.add(correctKey);

  while (results.length < count) {
    const wrong: Mapping = {};
    const shuffled = shuffle(right);

    Object.keys(correct).forEach((l, i) => {
      wrong[l] = shuffled[i % shuffled.length];
    });

    const key = JSON.stringify(wrong);
    if (!seen.has(key)) {
      seen.add(key);
      results.push(wrong);
    }
  }

  return results;
}

/* ---------------- Component ---------------- */
export function MatchMatrixBuilder({ form }: Props) {
  const [left, setLeft] = useState<string[]>(
    Array.from({ length: 4 }, (_, i) => makeLeft(i))
  );

  const [right, setRight] = useState<string[]>(
    Array.from({ length: 5 }, (_, i) => makeRight(i))
  );

  const [correctMap, setCorrectMap] = useState<Mapping>({});
  const [correctPosition, setCorrectPosition] = useState<
    (typeof OPTION_LABELS)[number] | ""
  >("");

  const options = form.watch("options") ?? [];
  const correct = form.watch("correctAnswer") as string;

  function syncMatrix(nextLeft: string[], nextRight: string[]) {
    form.setValue(
      "matrix",
      {
        left: nextLeft,
        right: nextRight,
      },
      { shouldDirty: true }
    );
  }

  /* ---------------- Controls ---------------- */
  function addLeft() {
    const next = [...left, makeLeft(left.length)];
    setLeft(next);
    syncMatrix(next, right);
  }

  function addRight() {
    const next = [...right, makeRight(right.length)];
    setRight(next);
    syncMatrix(left, next);
  }

  function setMapping(l: string, r: string) {
    setCorrectMap({ ...correctMap, [l]: r });
  }

  /* ---------------- Validation ---------------- */
  function validateSteps() {
    if (!left.length || !right.length) {
      toast.error("Both List-I and List-II must have items.");
      return false;
    }

    for (const l of left) {
      if (!correctMap[l]) {
        toast.error("Please complete the full correct mapping first.");
        return false;
      }
    }

    if (!correctPosition) {
      toast.error("Choose where to place the correct option (A/B/C/D).");
      return false;
    }

    return true;
  }

  /* ---------------- Generate ---------------- */
  function generateOptions() {
    if (!validateSteps()) return;

    const wrongs = generateWrongMappings(correctMap, right, 3);
    const allMaps: Mapping[] = [];

    OPTION_LABELS.forEach((label) => {
      if (label === correctPosition) {
        allMaps.push(correctMap);
      } else {
        allMaps.push(wrongs.shift()!);
      }
    });

    const generated = allMaps.map((map, i) => ({
      label: OPTION_LABELS[i],
      text: formatMapping(map),
    }));

    form.setValue("options", generated, {
      shouldDirty: true,
      shouldTouch: true,
    });

    form.setValue("correctAnswer", correctPosition, {
      shouldDirty: true,
      shouldTouch: true,
    });

    toast.success("Wrong options generated successfully");
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-6">
      {/* Lists */}
      <div className="grid grid-cols-2 gap-6">
        {/* List I */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">List-I</h4>

          {left.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={val}
                onChange={(e) => {
                  const next = [...left];
                  next[i] = e.target.value;
                  setLeft(next);
                  syncMatrix(next, right);
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  const next = left.filter((_, idx) => idx !== i);
                  setLeft(next);
                  syncMatrix(next, right);
                }}
              >
                ✕
              </Button>
            </div>
          ))}

          <Button size="sm" variant="secondary" onClick={addLeft}>
            Add Item
          </Button>
        </div>

        {/* List II */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">List-II</h4>

          {right.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={val}
                onChange={(e) => {
                  const next = [...right];
                  next[i] = e.target.value;
                  setRight(next);
                  syncMatrix(left, next);
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  const next = right.filter((_, idx) => idx !== i);
                  setRight(next);
                  syncMatrix(left, next);
                }}
              >
                ✕
              </Button>
            </div>
          ))}

          <Button size="sm" variant="secondary" onClick={addRight}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Correct Mapping */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Correct Mapping</h4>

        {left.map((l) => (
          <div key={l} className="flex items-center gap-3 max-w-lg">
            <span className="w-32 truncate font-medium" title={l}>
              {l}
            </span>

            <span className="text-muted-foreground">→</span>

            <select
              className="flex-1 rounded border bg-background px-2 py-1 text-sm dark:bg-muted"
              value={correctMap[l] ?? ""}
              onChange={(e) => setMapping(l, e.target.value)}
            >
              <option value="">Select</option>
              {right.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Correct Position */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Place Correct Option At</h4>

        <select
          className="w-32 rounded border bg-background px-2 py-1 text-sm dark:bg-muted"
          value={correctPosition}
          onChange={(e) =>
            setCorrectPosition(e.target.value as (typeof OPTION_LABELS)[number])
          }
        >
          <option value="">Select</option>
          {OPTION_LABELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Generate */}
      <Button type="button" onClick={generateOptions}>
        Generate Wrong Options
      </Button>

      {/* Preview */}
      {options.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Answer Options</h4>

          {options.map((opt) => {
            const isCorrect = correct === opt.label;

            return (
              <div
                key={opt.label}
                className={cn(
                  "flex gap-3 rounded border px-3 py-2 text-sm transition",
                  isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-muted"
                )}
              >
                <span className="font-medium w-8">({opt.label})</span>
                <span className="flex-1">{opt.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
