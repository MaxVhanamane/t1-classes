export type TestBuilderTest = {
    id: string;
    title: string;
    description: string | null;
    testType: "standard" | "sectioned";
    isActive: boolean;
};
