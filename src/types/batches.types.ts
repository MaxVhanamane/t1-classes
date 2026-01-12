export type BatchMode = "online" | "offline" | "hybrid"

export type BatchStatus =
    | "upcoming"
    | "ongoing"
    | "completed"
    | "cancelled"

export type CourseType =
    | "academic"
    | "foundation"
    | "exam"
    | "crash"

export interface BatchDetails {
    id: string
    name: string
    mode: BatchMode
    status: BatchStatus
    description: string | null
    startDate: string | null
    endDate: string | null
}

export interface BatchCourse {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnailImage: string | null
    courseType: CourseType
    targetExam: string | null
    classLevel: number | null
    subjects: string[] | null
}

export interface BatchDetailsResponse {
    batch: BatchDetails
    courses: BatchCourse[]
}
