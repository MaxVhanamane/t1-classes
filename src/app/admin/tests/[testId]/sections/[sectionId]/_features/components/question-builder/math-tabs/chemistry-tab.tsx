import { Button } from "@/src/components/ui/button";
import { EquationTabProps } from "../../../types/math-tabs";

export function ChemistryTab({
  insertSimple,
  insertTemplate,
  btnClass,
}: EquationTabProps) {
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\rightarrow")}
      >
        →
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\rightleftharpoons")}
      >
        ⇌
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\uparrow")}
      >
        ↑ (Gas)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\downarrow")}
      >
        ↓ (Solid)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("^{+}")}
      >
        ⁺ (Charge)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("^{-}")}
      >
        ⁻ (Charge)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("^{\\bullet}")}
      >
        • (Radical)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\Delta")}
      >
        Δ
      </Button>

      <div className="w-full h-px bg-border my-1" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-full">
        Complex Reactions & States
      </span>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\xrightarrow[#?]{#?}")}
      >
        → (Above & Below)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\xrightleftharpoons[#?]{#?}")}
      >
        ⇌ (Above & Below)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("{}_{#?}^{#?}#?")}
      >
        Isotope (Stack)
      </Button>

      {/* 
        FIXED: Wrapped the button labels in {" "} so JSX treats the curly braces as strings, not JavaScript code.
      */}
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("_{(s)}")}
      >
        {"_{(s)}"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("_{(l)}")}
      >
        {"_{(l)}"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("_{(g)}")}
      >
        {"_{(g)}"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("_{(aq)}")}
      >
        {"_{(aq)}"}
      </Button>
    </>
  );
}
