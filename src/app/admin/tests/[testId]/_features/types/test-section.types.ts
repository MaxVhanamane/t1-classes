export type PartialMarks = Record<number, number>;


export type TestSection = {
    id: string;
    testId: string;
    title: string;
    description: string | null;

    answerMode:
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix";

    fullMarks: number;
    negativeMarks: number;
    partialMarks: Record<number, number> | null;
    sortOrder: number;
    subjectLabel: string;

    sectionTotalQuestions?: number;
    sectionTotalMarks?: number;
};
