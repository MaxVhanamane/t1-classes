export type DistributionStatus =
    | "scheduled"
    | "ongoing"
    | "completed"
    | "cancelled";

export type TestDistributionDBRow = {
    id: string;
    test_id: string;

    batch_id: string;

    starts_at: string;
    ends_at: string;

    duration_minutes: number;

    created_by: string;
    created_at: string;
    updated_at: string;

    ranks_computed: boolean;

    tests: {
        title: string | null;
    } | null;
};

export type TestDistributionRow = {
    id: string;
    test_id: string;

    test_title: string;

    batch_id: string;

    starts_at: string;
    ends_at: string;

    duration_minutes: number;

    status: DistributionStatus;

    created_by: string;
    created_at: string;
    updated_at: string;

    ranks_computed: boolean;
};
