export type TestType = "standard" | "sectioned";

export interface CreateTestInput {
    title: string;
    description?: string;
    testType: TestType;
}
