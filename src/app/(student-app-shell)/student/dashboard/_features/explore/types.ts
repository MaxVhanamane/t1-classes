// Courses
export interface ExploreCourse {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnail_image: string | null
    course_type: string
    class_level: number | null
    board: string | null
    target_exam: string | null
    subjects: string[] | null
    price: number
}

export type BatchMode = "offline" | "online" | "hybrid";

export type BatchStatus =
    | "upcoming"
    | "ongoing"
    | "completed"
    | "cancelled";

// Batches
export interface ExploreBatch {
    id: string;
    name: string;
    description: string | null;
    mode: BatchMode;
    status: BatchStatus;
    start_date: string | null;
    duration: number | null;
    price: number;
    admission_open: boolean;
    course_count: number;
}
