export interface DistributionResultsSummary {
    participants: number
    submitted: number
    inProgress: number
    expired: number
    averageScore: number | null
    topScore: number | null
}



export type ResultsSort = "name" | "rank" | "score" | "time"

export interface DistributionResultRow {
    id: string
    user_id: string
    student_name: string
    student_email: string | null
    attempt_id: string
    obtained_marks: number
    total_marks: number
    correct_count: number
    wrong_count: number
    unanswered_count: number
    time_spent_seconds: number
    rank: number | null
    submitted_at: string | null
}


export interface ResultsQueryParams {
    distributionId: string
    page: number
    pageSize?: number
    search?: string
    sort?: ResultsSort
}


export interface PagedResults {
    items: DistributionResultRow[]
    page: number
    pageSize: number
    total: number
    hasMore: boolean
}
