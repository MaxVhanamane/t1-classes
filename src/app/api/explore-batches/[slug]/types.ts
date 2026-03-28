import { JSONContent } from "@tiptap/react";

import { ExploreCourseMarketing } from "../types";

import type {
    Category,
    Board,
    TargetExam,
    Subject,
    Language,
    Location,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

export type ExploreCourseForBatch =
    ExploreCourseMarketing;

export type ExploreBatchDetail = {
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;

    thumbnail_image: string | null;

    /* ---------- category ---------- */
    category: Category;
    board: Board | null;

    /* ---------- lifecycle ---------- */
    start_date: string;
    end_date: string;

    /* ---------- delivery ---------- */
    mode: "online" | "offline" | "hybrid";
    languages: Language[];

    location: Location | null;
    address: string | null;

    /* ---------- admissions ---------- */
    is_admission_open: boolean;

    /* ---------- pricing ---------- */
    sale_price: number;
    list_price: number;

    /* ---------- marketing ---------- */
    learning_outcomes: string[] | null;
    target_audience: string[] | null;

    /* ---------- academic ---------- */
    subjects: Subject[] | null;
    class_level: number | null;
    target_exam: TargetExam | null;

    description: JSONContent | null;

    capacity: number | null;

    courses: ExploreCourseForBatch[];
};
