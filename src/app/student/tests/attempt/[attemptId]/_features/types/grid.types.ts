export type GridState =
    | "not_visited"
    | "not_answered"
    | "answered"
    | "review"
    | "answered_review"

export type GridItem = {
    question_id: string
    section_id: string
    state: GridState
}

export type SectionGrid = {
    sectionId: string
    title: string
    startIndex: number
    questions: {
        id: string
        index: number
        state: GridState
    }[]
}
