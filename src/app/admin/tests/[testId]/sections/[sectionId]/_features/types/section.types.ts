export type TestSection = {
    id: string;
    testId: string;
    title: string;
    subjectLabel: string;
    description: string | null;
    answerMode: string;
    fullMarks: number;
    negativeMarks: number;
    partialMarks: Record<string, number> | null;
    sortOrder: number;
    is_locked: boolean;
    sectionTotalQuestions: number;
    sectionTotalMarks: number;
};
