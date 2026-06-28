export type TestBuilderTest = {
    id: string;
    title: string;
    description: string | null;
    test_type: "standard" | "sectioned";
    is_active: boolean;
    is_locked: boolean;
    createdBy?: string | null;
    totalMarks?: number;
    totalQuestions?: number;
};
