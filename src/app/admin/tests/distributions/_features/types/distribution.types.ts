export type DistributionStatus =
    | "scheduled"
    | "ongoing"
    | "completed"
    | "all"

export interface DistributionItem {
    id: string

    // REQUIRED for edit dialog
    test_id: string
    batch_id: string | null
    course_id: string | null

    // Display
    test_title: string
    batch_name: string | null
    course_title: string | null

    starts_at: string
    ends_at: string

    status: DistributionStatus
    audience: "batch" | "course" | "marketing"

    duration_minutes: number
    max_attempts: number
    created_at: string
}

export interface DistributionRow {
    id: string
    test_id: string
    batch_id: string | null
    course_id: string | null

    starts_at: string
    ends_at: string
    status: string
    audience: "batch" | "course" | "marketing"
    duration_minutes: number
    max_attempts: number
    created_at: string

    tests?: {
        title: string
    } | null

    batches?: {
        name: string
    } | null

    courses?: {
        title: string
    } | null
}

export interface DistributionQueryParams {
    page: number
    pageSize?: number
    status: DistributionStatus
    search?: string
}

export interface PagedDistributions {
    items: DistributionItem[]
    page: number
    pageSize: number
    total: number
    hasMore: boolean
}
