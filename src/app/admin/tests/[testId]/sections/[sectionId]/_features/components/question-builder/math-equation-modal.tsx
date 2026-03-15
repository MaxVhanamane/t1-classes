"use client";
import "mathlive";
import { useState, useRef } from "react";
import type { MathfieldElement } from "mathlive";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type Tab = "math" | "geometry" | "chemistry" | "physics";

interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

export function MathEquationModal({ open, onClose, onInsert }: Props) {
  const [tab, setTab] = useState<Tab>("math");

  const mathRef = useRef<MathfieldElement | null>(null);

  const insertTemplate = (latex: string, moveLeft = 1) => {
    const mf = mathRef.current;
    if (!mf) return;

    mf.insert(latex);

    for (let i = 0; i < moveLeft; i++) {
      mf.executeCommand("moveToPreviousChar");
    }

    mf.focus();
  };

  const insertSimple = (latex: string) => {
    const mf = mathRef.current;
    if (!mf) return;

    mf.insert(latex);
    mf.focus();
  };

  const handleInsert = () => {
    const mf = mathRef.current;
    if (!mf) return;

    const latex = mf.getValue().trim();

    if (!latex) return;

    onInsert(latex);

    mf.setValue("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-3xl bg-card"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Insert Equation</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            type="button"
            size="sm"
            variant={tab === "math" ? "default" : "ghost"}
            onClick={() => setTab("math")}
          >
            Math
          </Button>

          <Button
            type="button"
            size="sm"
            variant={tab === "geometry" ? "default" : "ghost"}
            onClick={() => setTab("geometry")}
          >
            Geometry
          </Button>

          <Button
            type="button"
            size="sm"
            variant={tab === "chemistry" ? "default" : "ghost"}
            onClick={() => setTab("chemistry")}
          >
            Chemistry
          </Button>

          <Button
            type="button"
            size="sm"
            variant={tab === "physics" ? "default" : "ghost"}
            onClick={() => setTab("physics")}
          >
            Physics
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 pt-3">
          {tab === "math" && (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("\\frac{}{}", 3)}
              >
                a/b
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("\\sqrt{}", 1)}
              >
                √
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("^{}", 1)}
              >
                x²
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("_{}", 1)}
              >
                x₂
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\int")}
              >
                ∫
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\sum")}
              >
                ∑
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\lim")}
              >
                lim
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\infty")}
              >
                ∞
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\pi")}
              >
                π
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\theta")}
              >
                θ
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\log")}
              >
                log
              </Button>
            </>
          )}

          {tab === "geometry" && (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\triangle ")}
              >
                △
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\angle ")}
              >
                ∠
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\parallel ")}
              >
                ∥
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\perp ")}
              >
                ⟂
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\cong ")}
              >
                ≅
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\sim ")}
              >
                ∼
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("\\overline{}", 1)}
              >
                AB̅
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("\\overrightarrow{}", 1)}
              >
                →AB
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("^\\circ")}
              >
                °
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("\\overset{\\frown}{}", 1)}
              >
                ⌢AB
              </Button>
            </>
          )}

          {tab === "chemistry" && (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\rightarrow")}
              >
                →
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\rightleftharpoons")}
              >
                ⇌
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("\\xrightarrow{}", 1)}
              >
                →()
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("^{+}")}
              >
                ⁺
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("^{-}")}
              >
                ⁻
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\uparrow")}
              >
                ↑
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\downarrow")}
              >
                ↓
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\Delta")}
              >
                Δ
              </Button>
            </>
          )}

          {tab === "physics" && (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => insertTemplate("\\vec{}", 1)}
              >
                →v
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\nabla")}
              >
                ∇
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\partial")}
              >
                ∂
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\cdot")}
              >
                ·
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\times")}
              >
                ×
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\omega")}
              >
                ω
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\lambda")}
              >
                λ
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => insertSimple("\\mu")}
              >
                μ
              </Button>
            </>
          )}
        </div>

        {/* Math Field */}
        <div className="border rounded-lg p-3 bg-muted/20 mt-4">
          <math-field
            ref={(el) => {
              if (el) mathRef.current = el;
            }}
            virtual-keyboard-mode="auto"
            smart-fence
            style={{
              width: "100%",
              minHeight: "70px",
              fontSize: "22px",
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button type="button" size="sm" onClick={handleInsert}>
            Insert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
