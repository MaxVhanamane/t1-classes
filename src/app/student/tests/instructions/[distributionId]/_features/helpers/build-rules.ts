import { SectionRow } from "../types/test-instructions.types";

export function buildRules(section: SectionRow) {
    const rules = [
        {
            label: "Marks for Correct Answer",
            value: `${section.full_marks} marks`,
        },
        {
            label: "Negative Marking",
            value:
                section.negative_marks < 0
                    ? `${Math.abs(section.negative_marks)} mark(s) deducted for incorrect answer`
                    : "No negative marking",
        },
        {
            label: "Partial Marking",
            value: section.partial_marks
                ? "Partial marks may be awarded"
                : "No partial marks",
        },
    ];

    // Only show selection rule for MCQ-type sections
    if (
        section.answer_mode === "single_select" ||
        section.answer_mode === "multi_select"
    ) {
        rules.push({
            label: "Answer Selection Limit",
            value: section.max_selections
                ? `You may select up to ${section.max_selections} option(s)`
                : "You may select more than one option",
        });
    }

    return rules;
}
