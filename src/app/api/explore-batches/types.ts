import { JSONContent } from "@tiptap/core";

import type {
    Category,
    Board,
    TargetExam,
    Subject,
    Language,
    Location,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

/* ================================================== */
/* Courses                                            */
/* ================================================== */

export interface ExploreCourse {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    thumbnail_image: string | null;

    /* ---------- category ---------- */
    category: Category;

    /* ---------- academic ---------- */
    class_level: number | null;
    board: Board | null;
    target_exam: TargetExam | null;
    subjects: Subject[] | null;

    /* ---------- pricing ---------- */
    list_price: number;
    sale_price: number;

    /* ---------- delivery ---------- */
    languages: Language[] | null;
}

export interface ExploreCourseMarketing {
    id: string;
    title: string;
    slug: string;

    description: JSONContent | null;
    subtitle: string | null;

    learning_outcomes: string[] | null;
    target_audience: string[] | null;

    thumbnail_image: string | null;

    /* ---------- category ---------- */
    category: Category;

    /* ---------- academic ---------- */
    class_level: number | null;
    board: Board | null;
    target_exam: TargetExam | null;
    subjects: Subject[] | null;

    /* ---------- pricing ---------- */
    list_price: number;
    sale_price: number;

    /* ---------- delivery ---------- */
    languages: Language[] | null;
}

/* ================================================== */
/* Batches                                            */
/* ================================================== */

export type BatchMode = "offline" | "online" | "hybrid";

export type BatchLifecycle =
    | "upcoming"
    | "ongoing"
    | "completed";

export interface ExploreBatch {
    id: string;

    /* ---------- identity ---------- */
    title: string;
    slug: string;
    subtitle: string | null;
    thumbnail_image: string | null;

    /* ---------- category ---------- */
    category: Category;
    board: Board | null;

    /* ---------- pricing ---------- */
    sale_price: number;
    list_price: number;

    /* ---------- delivery ---------- */
    mode: BatchMode;
    languages: Language[];
    location: Location | null;
    address: string | null;

    /* ---------- lifecycle ---------- */
    start_date: string;
    end_date: string;

    /* ---------- admissions ---------- */
    is_admission_open: boolean;

    /* ---------- academic ---------- */
    subjects: Subject[] | null;
    class_level: number | null;
    target_exam: TargetExam | null;

    /* ---------- relations ---------- */
    course_count: number;
}
