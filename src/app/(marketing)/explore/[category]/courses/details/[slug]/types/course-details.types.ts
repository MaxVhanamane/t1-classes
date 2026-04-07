import { JSONContent } from "@tiptap/react";

import type {
    Category,
    Board,
    TargetExam,
    Subject,
    Language,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

export type CourseDetails = {
    id: string;
    title: string;
    subtitle: string | null;

    /* ---------- marketing ---------- */
    learning_outcomes: string[] | null;
    target_audience: string[] | null;

    slug: string;
    description: JSONContent | null;

    thumbnailImage: string | null;

    /* ---------- category ---------- */
    category: Category;

    /* ---------- academic ---------- */
    classLevel: number | null;
    board: Board | null;
    targetExam: TargetExam | null;
    subjects: Subject[] | null;

    /* ---------- pricing ---------- */
    sale_price: number;
    list_price: number;

    /* ---------- delivery ---------- */
    languages: Language[] | null;
};
