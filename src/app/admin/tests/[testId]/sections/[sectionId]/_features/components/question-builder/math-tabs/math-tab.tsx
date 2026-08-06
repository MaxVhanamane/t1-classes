"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { EquationTabProps } from "../../../types/math-tabs";

export function MathTab({
  insertSimple,
  insertTemplate,
  btnClass,
}: EquationTabProps) {
  // =========================
  // Matrix Builder State
  // =========================
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [bracket, setBracket] = useState<"p" | "b">("p"); // "p" = ( ), "b" = [ ]

  const handleInsertMatrix = () => {
    const env = bracket === "p" ? "pmatrix" : "bmatrix";
    let latex = `\\begin{${env}} `;

    for (let r = 0; r < rows; r++) {
      // Create an array of '#?' for each column in the row
      const rowArr = Array(cols).fill("#?");
      latex += rowArr.join(" & ");

      // Add row break if it's not the last row
      if (r < rows - 1) {
        latex += " \\\\ ";
      }
    }

    latex += ` \\end{${env}}`;
    insertTemplate(latex);
  };

  return (
    <>
      {/* Operators & Symbols */}
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\pm")}
      >
        ±
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\neq")}
      >
        ≠
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\approx")}
      >
        ≈
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\propto")}
      >
        ∝
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\pi")}
      >
        π
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\theta")}
      >
        θ
      </Button>

      {/* Sets & Logic */}
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\in")}
      >
        ∈
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\subset")}
      >
        ⊂
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\cup")}
      >
        ∪
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\cap")}
      >
        ∩
      </Button>

      {/* Grouping (Curly Braces included!) */}
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\left\\{ #? \\right\\}")}
      >
        {"{ }"}
      </Button>

      {/* Functions */}
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\sin\\left(#?\\right)")}
      >
        sin
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\cos\\left(#?\\right)")}
      >
        cos
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\tan\\left(#?\\right)")}
      >
        tan
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\log_{#?}\\left(#?\\right)")}
      >
        log
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\ln\\left(#?\\right)")}
      >
        ln
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\binom{#?}{#?}")}
      >
        nCr
      </Button>

      {/* ========================= */}
      {/* CUSTOM MATRIX BUILDER     */}
      {/* ========================= */}
      <div className="col-span-full w-full h-px bg-border my-1" />
      <span className="col-span-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-full">
        Custom Matrix
      </span>

      <div className="col-span-full w-full flex items-center gap-3 p-2 mt-1 rounded-md border bg-muted/20">
        {/* Dimensions Selector */}
        <div className="flex items-center gap-1">
          <select
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="h-7 w-10 text-xs text-center bg-background border rounded outline-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground font-medium">×</span>
          <select
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="h-7 w-10 text-xs text-center bg-background border rounded outline-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Bracket Style Toggle */}
        <div className="flex items-center bg-background border rounded h-7 overflow-hidden">
          <button
            type="button"
            onClick={() => setBracket("p")}
            className={`px-2.5 h-full text-xs font-medium transition-colors ${
              bracket === "p"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            ( )
          </button>
          <div className="w-px h-full bg-border" />
          <button
            type="button"
            onClick={() => setBracket("b")}
            className={`px-2.5 h-full text-xs font-medium transition-colors ${
              bracket === "b"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            [ ]
          </button>
        </div>

        {/* Insert Action */}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 px-4 text-xs ml-auto font-semibold"
          onClick={handleInsertMatrix}
        >
          Insert
        </Button>
      </div>
    </>
  );
}
