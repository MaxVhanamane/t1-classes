// types/mathlive.d.ts

import type { MathfieldElement } from "mathlive";
import "react";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "math-field": React.DetailedHTMLProps<
                React.HTMLAttributes<MathfieldElement>,
                MathfieldElement
            >;
        }
    }
}
