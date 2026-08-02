import type { TestSection } from "./test-section.types";

export type TestBuilderTest = {
    id: string;
    title: string;
    description: string | null;
    test_type: "standard" | "sectioned";
    is_active: boolean;
    is_locked: boolean;
    createdBy?: string | null;
};

// This maps exactly to the JSON output of the secure RPC
export type TestBuilderDetailsResponse = {
    test: TestBuilderTest;

    totalSections: number;
    totalMarks: number;
    totalQuestions: number;

    sections: TestSection[];
};
