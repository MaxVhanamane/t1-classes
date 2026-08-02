export type DistributionStatus =
    | "scheduled"
    | "ongoing"
    | "completed";

export interface DistributionItem {
    id: string;

    test_id: string;

    batch_id: string;

    /* ---------- Display ---------- */

    test_title: string;

    // NEW FIELDS
    test_type: "standard" | "sectioned";
    total_sections: number;
    total_questions: number;
    total_marks: number;

    // NEW: Array of subject labels covered in this test
    subject_labels: string[];

    batch_name: string | null;

    starts_at: string;

    ends_at: string;

    status: DistributionStatus;

    duration_minutes: number;

    created_at: string;
}

export interface DistributionRow {
    id: string;

    test_id: string;

    batch_id: string;

    starts_at: string;

    ends_at: string;

    duration_minutes: number;

    created_at: string;

    tests: {
        title: string;
        // NEW FIELDS
        test_type: "standard" | "sectioned";
        total_sections: number;
        total_questions: number;
        total_marks: number;
        test_sections?: Array<{
            subject_label: string;
        }>;
    } | null;

    batches: {
        title: string;
    } | null;
}

export type DistributionQueryParams = {
    search: string;

    createdBy: string | "me" | null;

    status: DistributionStatus;

    page: number;
};

export interface PagedDistributions {
    items: DistributionItem[];

    page: number;

    pageSize: number;

    total: number;

    totalPages: number;

    currentUserId: string;

    isAdmin: boolean;
}
