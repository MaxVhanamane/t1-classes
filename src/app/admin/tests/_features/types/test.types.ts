export type TestType = "standard" | "sectioned";


export interface TestRow {
    id: string;
    title: string;
    description: string | null;
    test_type: string;
    created_at: string;
    is_locked: boolean;
}
