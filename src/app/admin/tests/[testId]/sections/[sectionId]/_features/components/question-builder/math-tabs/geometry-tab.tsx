import { EquationTabProps } from "../../../types/math-tabs";
import { Button } from "@/src/components/ui/button";

export function GeometryTab({
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
        onClick={() => insertSimple("\\triangle ")}
      >
        △
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\angle ")}
      >
        ∠
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\parallel ")}
      >
        ∥
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\perp ")}
      >
        ⟂
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\cong ")}
      >
        ≅
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("\\sim ")}
      >
        ∼
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\overline{#?}")}
      >
        AB̅ (Line)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\overrightarrow{#?}")}
      >
        →AB (Ray)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertTemplate("\\overset{\\frown}{#?}")}
      >
        ⌢AB (Arc)
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={btnClass}
        onClick={() => insertSimple("^\\circ")}
      >
        ° (Degree)
      </Button>
    </>
  );
}
