export type DistributionRow = {
    id: string
    test_id: string
    starts_at: string
    ends_at: string
}

export type AttemptRow = {
    id: string
    status: "in_progress" | "submitted" | "expired"
}

export type SectionRow = {
    id: string
    title: string
    description: string | null
    answer_mode:
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix"
    full_marks: number
    negative_marks: number
    partial_marks: string | null
    max_selections: number | null
    subject_label: string
}

export type PageData = {
    distribution: DistributionRow
    status: "scheduled" | "ongoing" | "ended"
    attempt: AttemptRow | null
    sections: SectionRow[]
}
