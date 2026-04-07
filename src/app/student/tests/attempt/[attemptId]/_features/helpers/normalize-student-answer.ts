import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";

export function normalizeStudentAnswer(
    mode: Section["answerMode"],
    draft: unknown | null
): Record<string, unknown> | null {
    if (draft == null) return null;

    switch (mode) {
        case "single_select":
        case "match_matrix":
            return {
                option_id: String(draft),
            };

        case "multi_select":
            return {
                option_ids: Array.isArray(draft)
                    ? draft.map(String)
                    : [],
            };

        case "numerical_input": {
            const num = Number(draft);
            if (Number.isNaN(num)) return null;

            return {
                value: num,
            };
        }

        default:
            return null;
    }
}
