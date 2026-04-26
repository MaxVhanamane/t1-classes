"use client";

import { useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateQuestionInput } from "../../zod/question.schema";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { JSONContent } from "@tiptap/react";

/* -------------------------------- Types -------------------------------- */

interface Props {
  form: UseFormReturn<CreateQuestionInput>;
  questionText: JSONContent;
}

type Mapping = Record<string, string>;

type OptionLabel = "A" | "B" | "C" | "D";

type PreviewOption = {
  label: OptionLabel;
  text: string;
};

const OPTION_LABELS: OptionLabel[] = ["A", "B", "C", "D"];

/* ---------------------------- TipTap Utilities --------------------------- */

function getNodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";

  const n = node as Record<string, unknown>;

  let result = "";

  if (typeof n.text === "string") result += n.text;

  if (Array.isArray(n.content)) {
    for (const child of n.content) {
      result += getNodeText(child);
    }
  }

  return result;
}

function findTable(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;

  const n = node as Record<string, unknown>;

  if (n.type === "table") return n;

  if (Array.isArray(n.content)) {
    for (const child of n.content) {
      const found = findTable(child);
      if (found) return found;
    }
  }

  return null;
}

function tokenFromCell(text: string): string | null {
  const value = text.trim();

  if (!value) return null;

  const match =
    value.match(/^([A-Za-z]+)[.):-]/) ||
    value.match(/^([IVXLCDM]+)[.):-]/i) ||
    value.match(/^(\d+)[.):-]/) ||
    value.match(/^([A-Za-z]+)$/) ||
    value.match(/^(\d+)$/);

  return match ? match[1] : null;
}

function extractMatrixLabels(questionText: unknown) {
  const table = findTable(questionText);

  if (!table) return { left: [], right: [] };

  const rows = Array.isArray(table.content) ? table.content : [];

  const left: string[] = [];
  const right: string[] = [];

  rows.forEach((row, rowIndex) => {
    if (
      !row ||
      typeof row !== "object" ||
      !Array.isArray((row as Record<string, unknown>).content)
    ) {
      return;
    }

    if (rowIndex === 0) return;

    const cells = (row as Record<string, unknown>).content as unknown[];

    if (cells.length < 2) return;

    const leftText = getNodeText(cells[0]).trim();
    const rightText = getNodeText(cells[1]).trim();

    const l = tokenFromCell(leftText);
    const r = tokenFromCell(rightText);

    if (l && !left.includes(l)) left.push(l);
    if (r && !right.includes(r)) right.push(r);
  });

  return { left, right };
}

/* ------------------------------ Helpers ------------------------------ */

function csvToArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function formatMapping(map: Mapping) {
  return Object.entries(map)
    .map(([l, r]) => `${l} → ${r}`)
    .join(", ");
}

function toEditorDoc(text: string) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

function mappingKey(map: Mapping) {
  return JSON.stringify(
    Object.keys(map)
      .sort()
      .reduce((acc, key) => {
        acc[key] = map[key];
        return acc;
      }, {} as Mapping),
  );
}

/* -------------------------------------------------------
   Guaranteed wrong options
------------------------------------------------------- */
function generateWrongMappings(
  correct: Mapping,
  right: string[],
  count: number,
): Mapping[] {
  const results: Mapping[] = [];
  const seen = new Set<string>();

  seen.add(mappingKey(correct));

  const leftKeys = Object.keys(correct);

  let attempts = 0;
  const maxAttempts = 1000;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;

    const wrong: Mapping = {};
    const shuffled = shuffle(right);

    leftKeys.forEach((key, index) => {
      wrong[key] = shuffled[index % shuffled.length];
    });

    /* force at least one mismatch */
    const hasMismatch = leftKeys.some((key) => wrong[key] !== correct[key]);

    if (!hasMismatch) continue;

    const key = mappingKey(wrong);

    if (!seen.has(key)) {
      seen.add(key);
      results.push(wrong);
    }
  }

  return results;
}

/* ----------------------------- Component ----------------------------- */

export function MatchMatrixBuilder({ form, questionText }: Props) {
  const detected = useMemo(
    () => extractMatrixLabels(questionText),
    [questionText],
  );

  const [manualMode, setManualMode] = useState(false);
  const [manualLeft, setManualLeft] = useState("");
  const [manualRight, setManualRight] = useState("");

  const left = manualMode ? csvToArray(manualLeft) : detected.left;
  const right = manualMode ? csvToArray(manualRight) : detected.right;

  const [correctMap, setCorrectMap] = useState<Mapping>({});
  const [correctPosition, setCorrectPosition] = useState<OptionLabel | "">("");
  const [previewOptions, setPreviewOptions] = useState<PreviewOption[]>([]);

  function setMapping(leftKey: string, rightKey: string) {
    setCorrectMap((prev) => ({
      ...prev,
      [leftKey]: rightKey,
    }));
  }

  function validateSteps() {
    if (!left.length || !right.length) {
      toast.error("No labels found.");
      return false;
    }

    for (const l of left) {
      if (!correctMap[l]) {
        toast.error("Please complete all correct pairs.");
        return false;
      }
    }

    if (!correctPosition) {
      toast.error("Choose correct option position.");
      return false;
    }

    return true;
  }

  function buildAndSaveOptions(position: OptionLabel) {
    const wrongs = generateWrongMappings(correctMap, right, 3);

    if (wrongs.length < 3) {
      toast.error("Could not generate unique wrong options.");
      return;
    }

    const allMaps: Mapping[] = [];

    OPTION_LABELS.forEach((label) => {
      if (label === position) {
        allMaps.push(correctMap);
      } else {
        allMaps.push(wrongs.shift()!);
      }
    });

    const generated = allMaps.map((map, i) => ({
      label: OPTION_LABELS[i],
      text: toEditorDoc(formatMapping(map)),
    }));

    const preview = allMaps.map((map, i) => ({
      label: OPTION_LABELS[i],
      text: formatMapping(map),
    }));

    form.setValue("options", generated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    form.setValue("correctAnswer", position, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setPreviewOptions(preview);
  }

  function generateOptions() {
    if (!validateSteps()) return;

    buildAndSaveOptions(correctPosition as OptionLabel);

    toast.success("Options generated successfully");
  }

  /* -------------------------------------------------------
     FIXED:
     No useEffect.
     Regenerate immediately when dropdown changes.
  ------------------------------------------------------- */
  function handleCorrectPositionChange(value: OptionLabel) {
    setCorrectPosition(value);

    if (previewOptions.length > 0) {
      buildAndSaveOptions(value);
    }
  }

  return (
    <div className="space-y-6">
      {/* Labels */}
      <div className="rounded-md border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Matrix Labels</h4>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setManualMode(!manualMode)}
          >
            {manualMode ? "Use Auto Detect" : "Edit Labels"}
          </Button>
        </div>

        {!manualMode ? (
          <>
            <div className="text-sm">
              <span className="font-medium">Left:</span>{" "}
              {left.join(", ") || "None"}
            </div>

            <div className="text-sm">
              <span className="font-medium">Right:</span>{" "}
              {right.join(", ") || "None"}
            </div>
          </>
        ) : (
          <div className="grid gap-3">
            <Input
              placeholder="Left labels"
              value={manualLeft}
              onChange={(e) => setManualLeft(e.target.value)}
            />

            <Input
              placeholder="Right labels"
              value={manualRight}
              onChange={(e) => setManualRight(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Correct pairs */}
      {left.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Correct Pairs</h4>

          {left.map((l) => (
            <div key={l} className="flex items-center gap-3">
              <span className="w-24 font-medium">{l}</span>
              <span>→</span>

              <select
                className="flex-1 rounded border px-2 py-1 text-sm"
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
      )}

      {/* Correct Position */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Place Correct Option At</h4>

        <select
          className="w-32 rounded border px-2 py-1 text-sm"
          value={correctPosition}
          onChange={(e) =>
            handleCorrectPositionChange(e.target.value as OptionLabel)
          }
        >
          <option value="">Select</option>

          {OPTION_LABELS.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Button type="button" onClick={generateOptions}>
        Generate Options
      </Button>

      {/* Preview */}
      {previewOptions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Answer Options</h4>

          {previewOptions.map((opt) => {
            const isCorrect = opt.label === correctPosition;

            return (
              <div
                key={opt.label}
                className={cn(
                  "flex gap-3 rounded border px-3 py-2 text-sm",
                  isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-muted",
                )}
              >
                <span className="w-8 font-medium">({opt.label})</span>
                <span className="flex-1">{opt.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
