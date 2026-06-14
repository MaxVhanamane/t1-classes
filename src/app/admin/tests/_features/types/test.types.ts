export type TestType =
    | "standard"
    | "sectioned";

export interface TestRow {
    id: string;

    title: string;

    description: string | null;

    test_type: TestType;

    created_at: string;

    is_locked: boolean;

    created_by: {
        id: string;

        full_name: string;
    } | null;
}


export type TestListResponse = {
    items: TestRow[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;

    currentUserId: string,

    isAdmin: boolean,
};
