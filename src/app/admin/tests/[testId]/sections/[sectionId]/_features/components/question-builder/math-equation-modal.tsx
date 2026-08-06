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

// Import the sub-components
import { CommonTools } from "./math-tabs/common-tools";
import { MathTab } from "./math-tabs/math-tab";
import { CalculusTab } from "./math-tabs/calculus-tab";
import { GeometryTab } from "./math-tabs/geometry-tab";
import { ChemistryTab } from "./math-tabs/chemistry-tab";
import { PhysicsTab } from "./math-tabs/physics-tab";

type Tab = "math" | "calculus" | "geometry" | "chemistry" | "physics";

interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

export function MathEquationModal({ open, onClose, onInsert }: Props) {
  const [tab, setTab] = useState<Tab>("math");
  const mathRef = useRef<MathfieldElement | null>(null);

  const btnClass =
    "h-8 px-3 py-1 text-[11px] font-medium border shadow-sm hover:bg-accent";

  // Completely simplified: #? tells MathLive exactly where the boxes are
  const insertTemplate = (latex: string) => {
    const mf = mathRef.current;
    if (!mf) return;
    mf.insert(latex);
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

  // Shared props for all tab components
  const tabProps = { insertSimple, insertTemplate, btnClass };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-4xl bg-card p-4 top-5 translate-y-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          // 1. Check if the MathLive virtual keyboard is currently open
          if (
            window.mathVirtualKeyboard &&
            window.mathVirtualKeyboard.visible
          ) {
            e.preventDefault(); // Stop the modal from closing
            window.mathVirtualKeyboard.hide(); // Close the virtual keyboard
          } else {
            // 2. If the keyboard is NOT open, do you want Escape to close the whole modal?
            // If YES: delete the line below.
            // If NO (you want to force users to click "Cancel"): keep the line below.
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Equation Editor</DialogTitle>
        </DialogHeader>

        {/* --- TABS --- */}
        <div className="flex flex-wrap gap-1.5 border-b pb-2">
          {(
            ["math", "calculus", "geometry", "chemistry", "physics"] as Tab[]
          ).map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={tab === t ? "default" : "ghost"}
              className="h-7 text-xs px-3 capitalize"
              onClick={() => setTab(t)}
            >
              {t}
            </Button>
          ))}
        </div>

        {/* --- COMMON TOOLS (ALWAYS VISIBLE) --- */}
        <CommonTools {...tabProps} />

        {/* --- DYNAMIC TAB CONTENT --- */}
        <div className="flex flex-wrap gap-1.5 pt-2 min-h-[90px] content-start">
          {tab === "math" && <MathTab {...tabProps} />}
          {tab === "calculus" && <CalculusTab {...tabProps} />}
          {tab === "geometry" && <GeometryTab {...tabProps} />}
          {tab === "chemistry" && <ChemistryTab {...tabProps} />}
          {tab === "physics" && <PhysicsTab {...tabProps} />}
        </div>

        {/* --- MATH FIELD --- */}
        <div className="border rounded-md p-2 bg-muted/10 mt-2 shadow-inner">
          <math-field
            ref={(el) => {
              if (el) {
                mathRef.current = el;
                el.smartSuperscript = false; // Prevents kicking out of boxes
              }
            }}
            virtual-keyboard-mode="auto"
            smart-fence
            className="w-full min-h-[100px] text-2xl outline-none [--caret-color:currentColor] [--selection-background-color:Highlight] [--selection-color:HighlightText]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
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
