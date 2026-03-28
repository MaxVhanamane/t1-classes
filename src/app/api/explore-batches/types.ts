import { JSONContent } from '@tiptap/core'
// Courses
export interface ExploreCourse {
    id: string
    title: string
    slug: string
    subtitle: string | null
    thumbnail_image: string | null
    course_type: string
    class_level: number | null
    board: string | null
    target_exam: string | null
    subjects: string[] | null
    list_price: number
    sale_price: number
    languages: string[] | null
}

export interface ExploreCourseMarketing {
    id: string
    title: string
    slug: string
    description: JSONContent | null
    subtitle: string | null
    learning_outcomes: string[] | null
    target_audience: string[] | null
    thumbnail_image: string | null
    course_type: string
    class_level: number | null
    board: string | null
    target_exam: string | null
    subjects: string[] | null
    list_price: number
    sale_price: number
    languages: string[] | null
}

export type BatchMode = "offline" | "online" | "hybrid";

export type BatchLifecycle =
    | "upcoming"
    | "ongoing"
    | "completed";

export interface ExploreBatch {
    id: string;

    /* Identity */
    title: string;
    slug: string;
    subtitle: string | null;
    thumbnail_image: string | null;

    /* Pricing */
    sale_price: number;
    list_price: number;

    /* Delivery */
    mode: BatchMode;
    languages: string[];
    location: string | null;

    /* Lifecycle */
    start_date: string;
    end_date: string;

    /* Admissions */
    is_admission_open: boolean;

    /* Academic */
    subjects: string[] | null;
    class_level: number | null;
    target_exam: string | null;

    /* Relations */
    course_count: number;
}
