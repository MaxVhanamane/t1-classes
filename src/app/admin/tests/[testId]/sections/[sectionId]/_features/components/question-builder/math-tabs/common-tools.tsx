import { Button } from "@/src/components/ui/button";
import { EquationTabProps } from "../../../types/math-tabs";

export function CommonTools({ insertTemplate, btnClass }: EquationTabProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-2 pb-2 border-b bg-muted/20 rounded-md px-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-full flex items-center h-4">
        Common
      </span>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("^{#?}")}
      >
        x² (Sup)
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("_{#?}")}
      >
        x₂ (Sub)
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\frac{#?}{#?}")}
      >
        a/b
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\sqrt{#?}")}
      >
        √
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\dfrac{#?}{#?}")} // <-- Changed \frac to \dfrac
        title="Fraction"
      >
        a/b
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\sqrt[#?]{#?}")}
      >
        ⁿ√
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\mathrm{#?}")}
      >
        Text Box
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\left\\{ #? \\right\\}")}
      >
        {"{ }"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\left( #? \\right)")}
      >
        ( )
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\left[ #? \\right]")}
      >
        [ ]
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => insertTemplate("\\left| #? \\right|")}
      >
        | x | (Abs)
      </Button>

      
    </div>
  );
}
