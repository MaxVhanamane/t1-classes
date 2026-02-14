export type DistributionStatus =
    | "scheduled"
    | "ongoing"
    | "completed"
    | "cancelled";

export type DistributionAudience =
    | "batch"
    | "course"
    | "marketing";


export type TestDistributionDBRow = {
    id: string;
    test_id: string;

    audience: DistributionAudience
    batch_id: string | null;
    course_id: string | null;

    starts_at: string;
    ends_at: string;

    duration_minutes: number;
    max_attempts: number;

    status: DistributionStatus;

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

    audience: "batch" | "course" | "marketing";
    batch_id: string | null;
    course_id: string | null;

    starts_at: string;
    ends_at: string;

    duration_minutes: number;
    max_attempts: number;

    status: DistributionStatus;

    created_by: string;
    created_at: string;
    updated_at: string;

    ranks_computed: boolean;
};
