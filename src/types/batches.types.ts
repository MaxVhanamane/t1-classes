import { JSONContent } from "@tiptap/react";

import type {
    Category,
    Board,
    TargetExam,
    Subject,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

/* ---------------- Core Enums ---------------- */

export type BatchMode =
    | "online"
    | "offline"
    | "hybrid";

/* ---------------- Batch Details ---------------- */

export interface BatchDetails {
    id: string;

    /* ---------- identity ---------- */
    title: string;
    subtitle: string | null;

    /* ---------- category ---------- */
    category: Category;
    board: Board | null;

    /* ---------- delivery ---------- */
    mode: BatchMode;

    /* ---------- visibility ---------- */
    is_active: boolean;
    is_admission_open: boolean;

    /* ---------- content ---------- */
    description: JSONContent | null;

    /* ---------- academic ---------- */
    target_exam: TargetExam | null;
    class_level: number | null;
    subjects: Subject[] | null;

    /* ---------- lifecycle ---------- */
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

    /* ---------- category ---------- */
    category: Category;

    /* ---------- academic ---------- */
    target_exam: TargetExam | null;
    class_level: number | null;
    subjects: Subject[] | null;
}

/* ---------------- API Response ---------------- */

export interface BatchDetailsResponse {
    batch: BatchDetails;
    courses: BatchCourse[];
}
