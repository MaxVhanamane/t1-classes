export type SectionTemplate = {
    id: string;
    name: string;
    description: string;
    answerMode:
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix";

    maxSelections: number | null;

    defaultFullMarks: number;
    defaultNegativeMarks: number;
    defaultPartialMarks: Record<string, number> | null;
};
