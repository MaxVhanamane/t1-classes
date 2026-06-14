export interface DistributionResultsSummary {
    testTitle: string;
    participants: number;
    submitted: number;
    inProgress: number;
    expired: number;
    averageScore: number | null;
    topScore: number | null;
}
export type ResultsSort = "rank" | "name" | "time";

export interface DistributionResultRow {
    id: string;

    user_id: string;

    attempt_id: string;

    student_name: string;

    student_email: string | null;

    obtained_marks: number;

    total_marks: number;

    rank: number | null;

    percentile: number | null;

    correct_count: number;

    partial_correct_count: number;

    wrong_count: number;

    unanswered_count: number;

    completion_percentage: number;

    time_spent_seconds: number;

    submitted_at: string | null;
}

export interface ResultsQueryParams {
    distributionId: string;

    page: number;

    pageSize?: number;

    search?: string;

    sort?: ResultsSort;
}

export interface PagedResults {
    items: DistributionResultRow[];

    page: number;

    pageSize: number;

    total: number;

    hasMore: boolean;
}
