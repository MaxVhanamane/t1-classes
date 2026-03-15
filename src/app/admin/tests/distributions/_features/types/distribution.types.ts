export type DistributionStatus =
    | "scheduled"
    | "ongoing"
    | "completed"
    | "all";

export interface DistributionItem {
    id: string; // REQUIRED for edit dialog

    test_id: string;
    batch_id: string;

    // Display
    test_title: string;
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

    tests?: {
        title: string;
    } | null;

    batches?: {
        title: string;
    } | null;
}

export interface DistributionQueryParams {
    page: number;
    pageSize?: number;
    status: DistributionStatus;
    search?: string;
}

export interface PagedDistributions {
    items: DistributionItem[];
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}
