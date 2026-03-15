import { JSONContent } from "@tiptap/react";

/* ---------------- Core Enums ---------------- */

export type BatchMode =
    | "online"
    | "offline"
    | "hybrid";

export type CourseType =
    | "academic"
    | "foundation"
    | "exam"
    | "crash";

/* ---------------- Batch Details ---------------- */

export interface BatchDetails {
    id: string;

    /* Identity */
    title: string;
    subtitle: string | null;

    /* Delivery */
    mode: BatchMode;

    /* Visibility */
    is_active: boolean;
    is_admission_open: boolean;

    /* Content */
    description: JSONContent | null;

    /* Lifecycle */
    start_date: string;
    end_date: string;
}

/* ---------------- Batch Course ---------------- */

export interface BatchCourse {
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;
    thumbnail_image: string | null;
    course_type: CourseType;
    target_exam: string | null;
    class_level: number | null;
    subjects: string[] | null;
}

/* ---------------- API Response ---------------- */

export interface BatchDetailsResponse {
    batch: BatchDetails;
    courses: BatchCourse[];
}
