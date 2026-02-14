import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types"

export function denormalizeStudentAnswer(
    mode: Section["answerMode"],
    answer: unknown
): unknown | null {
    if (!answer || typeof answer !== "object") return null

    const a = answer as Record<string, unknown>

    switch (mode) {
        case "single_select":
        case "match_matrix":
            return typeof a.option_id === "string"
                ? a.option_id
                : null

        case "multi_select":
            return Array.isArray(a.option_ids)
                ? a.option_ids
                : []

        case "numerical_input":
            return typeof a.value === "number"
                ? a.value
                : null

        default:
            return null
    }
}
