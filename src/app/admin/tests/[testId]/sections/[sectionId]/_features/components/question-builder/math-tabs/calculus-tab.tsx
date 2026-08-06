import { Button } from "@/src/components/ui/button";
import { EquationTabProps } from "../../../types/math-tabs";

export function CalculusTab({
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
        onClick={() => insertTemplate("\\int_{#?}^{#?}")}
      >
        ∫ (Definite)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\int")}
      >
        ∫ (Indefinite)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\iint")}
      >
        ∬
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\iiint")}
      >
        ∭
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\sum_{#?}^{#?}")}
      >
        ∑
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\prod_{#?}^{#?}")}
      >
        ∏
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\lim_{#? \\to #?}")}
      >
        lim
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\infty")}
      >
        ∞
      </Button>

      <div className="w-full h-px bg-border my-1" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-full">
        Derivatives
      </span>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\frac{d}{d#?}")}
      >
        d/dx
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\frac{d^{#?}}{d#?^{#?}}")}
      >
        dⁿ/dxⁿ
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\frac{\\partial}{\\partial #?}")}
      >
        ∂/∂x
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\nabla")}
      >
        ∇ (Nabla)
      </Button>
    </>
  );
}
