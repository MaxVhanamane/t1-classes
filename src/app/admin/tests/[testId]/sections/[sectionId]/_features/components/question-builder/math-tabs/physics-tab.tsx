import { Button } from "@/src/components/ui/button";
import { EquationTabProps } from "../../../types/math-tabs";

export function PhysicsTab({
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
        onClick={() => insertTemplate("\\vec{#?}")}
      >
        →v
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\hat{#?}")}
      >
        î (Unit)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\cdot")}
      >
        · (Dot)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\times")}
      >
        × (Cross)
      </Button>

      {/* Greek Constants */}
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\alpha")}
      >
        α
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\beta")}
      >
        β
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\gamma")}
      >
        γ
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\lambda")}
      >
        λ
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\mu")}
      >
        μ
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\rho")}
      >
        ρ
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\omega")}
      >
        ω
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\tau")}
      >
        τ
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\Phi")}
      >
        Φ
      </Button>

      <div className="w-full h-px bg-border my-1" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-full">
        Constants
      </span>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("G")}
      >
        G
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("c")}
      >
        c
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("h")}
      >
        h
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\hbar")}
      >
        ℏ
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("k_B")}
      >
        k_B
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\varepsilon_0")}
      >
        ε₀
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\mu_0")}
      >
        μ₀
      </Button>
    </>
  );
}
