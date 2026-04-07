import { SectionRow } from "../types/test-instructions.types"


export function answerModeLabel(
    mode: SectionRow["answer_mode"]
) {
    switch (mode) {
        case "single_select":
            return "Single Correct"
        case "multi_select":
            return "Multiple Correct"
        case "numerical_input":
            return "Numerical Answer"
        case "match_matrix":
            return "Matching"
        default:
            return "Unknown"
    }
}
