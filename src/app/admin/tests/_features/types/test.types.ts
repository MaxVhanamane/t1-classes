export type TestType = "standard" | "sectioned";


export interface TestRow {
    id: string; // uuid
    title: string;
    description: string | null;

    test_type: TestType;

    shuffle_questions: boolean;
    shuffle_options: boolean;

    created_by: string; // uuid (users.id FK)

    is_active: boolean;
    is_locked: boolean;

    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}
