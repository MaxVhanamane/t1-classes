"use client";

import { type Editor } from "@tiptap/react";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface QuickSymbolsProps {
  editor: Editor;
}

const SYMBOL_GROUPS = [
  {
    name: "Greek & Variables",
    symbols: [
      { char: "θ", label: "Theta", latex: "\\theta" },
      { char: "α", label: "Alpha", latex: "\\alpha" },
      { char: "β", label: "Beta", latex: "\\beta" },
      { char: "γ", label: "Gamma", latex: "\\gamma" },
      { char: "λ", label: "Lambda", latex: "\\lambda" },
      { char: "μ", label: "Mu", latex: "\\mu" },
      { char: "ω", label: "Omega (lower)", latex: "\\omega" },
      { char: "Ω", label: "Omega (upper) / Ohm", latex: "\\Omega" },
      { char: "ε", label: "Epsilon", latex: "\\varepsilon" },
      { char: "Δ", label: "Delta", latex: "\\Delta" },
      { char: "Σ", label: "Sigma (Sum)", latex: "\\Sigma" },
      { char: "π", label: "Pi", latex: "\\pi" },
    ],
  },
  {
    name: "Math & Geometry",
    symbols: [
      { char: "°", label: "Degree" }, // Left as plain text
      { char: "△", label: "Triangle", latex: "\\triangle" },
      { char: "∠", label: "Angle", latex: "\\angle" },
      { char: "⊥", label: "Perpendicular", latex: "\\perp" },
      { char: "∥", label: "Parallel", latex: "\\parallel" },
      { char: "≅", label: "Congruent", latex: "\\cong" },
      { char: "∼", label: "Similar", latex: "\\sim" },
      { char: "∴", label: "Therefore", latex: "\\therefore" },
      { char: "∵", label: "Because", latex: "\\because" },
      { char: "∝", label: "Proportional To", latex: "\\propto" },
      { char: "±", label: "Plus-Minus", latex: "\\pm" },
      { char: "×", label: "Multiply", latex: "\\times" },
      { char: "÷", label: "Divide", latex: "\\div" },
      { char: "√", label: "Square Root", latex: "\\sqrt{\\ }" },
      { char: "∞", label: "Infinity", latex: "\\infty" },
      { char: "≈", label: "Approximately", latex: "\\approx" },
      { char: "≠", label: "Not Equal", latex: "\\neq" },
    ],
  },
  {
    name: "Sets & Logic (JEE)",
    symbols: [
      { char: "∈", label: "Element Of", latex: "\\in" },
      { char: "∉", label: "Not Element Of", latex: "\\notin" },
      { char: "⊂", label: "Subset", latex: "\\subset" },
      { char: "∪", label: "Union", latex: "\\cup" },
      { char: "∩", label: "Intersection", latex: "\\cap" },
      { char: "∅", label: "Empty Set", latex: "\\emptyset" },
      { char: "⇒", label: "Implies", latex: "\\Rightarrow" },
      { char: "⇔", label: "If and Only If", latex: "\\Leftrightarrow" },
      { char: "ℝ", label: "Real Numbers", latex: "\\mathbb{R}" },
      { char: "ℤ", label: "Integers", latex: "\\mathbb{Z}" },
    ],
  },
  {
    name: "Chemistry & Physics",
    symbols: [
      { char: "→", label: "Reaction Arrow (Right)", latex: "\\rightarrow" },
      { char: "⇌", label: "Equilibrium Arrow", latex: "\\rightleftharpoons" },
      { char: "↑", label: "Gas Evolution (Up)", latex: "\\uparrow" },
      { char: "↓", label: "Precipitate (Down)", latex: "\\downarrow" },
      { char: "⁺", label: "Positive Charge", latex: "{}^{+}" },
      { char: "⁻", label: "Negative Charge", latex: "{}^{-}" },
      { char: "°C", label: "Degree Celsius" }, // Left as plain text
      { char: "e⁻", label: "Electron", latex: "e^{-}" },
      { char: "∫", label: "Integral", latex: "\\int" },
      { char: "∂", label: "Partial Derivative", latex: "\\partial" },
      { char: "∇", label: "Nabla / Gradient", latex: "\\nabla" },
      { char: "ħ", label: "h-bar", latex: "\\hbar" },
      { char: "ε₀", label: "Epsilon Naught", latex: "\\varepsilon_0" },
      { char: "μ₀", label: "Mu Naught", latex: "\\mu_0" },
      { char: "î", label: "i-hat (Unit Vector)", latex: "\\hat{i}" },
      { char: "ĵ", label: "j-hat (Unit Vector)", latex: "\\hat{j}" },
      { char: "k̂", label: "k-hat (Unit Vector)", latex: "\\hat{k}" },
    ],
  },
];

export function QuickSymbolsAccordion({ editor }: QuickSymbolsProps) {
  const insertSymbol = (sym: { char: string; latex?: string }) => {
    // If it has a latex equivalent, insert it as an inlineMath node
    if (sym.latex) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "inlineMath",
          attrs: { latex: sym.latex },
        })
        .insertContent(" ") // Adds a trailing space so the user isn't stuck inside the node
        .run();
    } else {
      // Fallback for symbols without LaTeX (like ° or °C)
      editor
        .chain()
        .focus()
        .insertContent(sym.char + " ")
        .run();
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full border-b px-2">
      <AccordionItem value="symbols" className="border-b-0">
        <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:no-underline">
          Quick Symbols
        </AccordionTrigger>
        <AccordionContent className="pb-3">
          <div className="flex flex-col gap-3">
            <TooltipProvider delayDuration={300}>
              {SYMBOL_GROUPS.map((group) => (
                <div key={group.name} className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.name}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.symbols.map((sym) => (
                      <Tooltip key={sym.char}>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 min-w-7 px-2 text-sm shadow-none"
                            onMouseDown={(e) => e.preventDefault()} // Prevents focus loss!
                            onClick={() => insertSymbol(sym)}
                          >
                            {sym.char}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          {sym.label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
