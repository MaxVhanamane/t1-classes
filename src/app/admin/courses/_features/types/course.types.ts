import type {
    Category,
    Board,
    TargetExam,
    Subject,
    Language,
} from "../../../batches/_features/zod-schema/schema";

/* ---------------- Course List Item ---------------- */

export type CourseRow = {
    id: string;

    title: string;

    slug: string;

    subtitle: string | null;

    thumbnail_image: string | null;

    /* ---------- Category ---------- */

    category: Category;

    /* ---------- Academic ---------- */

    class_level: number | null;

    board: Board | null;

    target_exam: TargetExam | null;

    subjects: Subject[] | null;

    languages: Language[];

    /* ---------- Pricing ---------- */

    list_price: number;

    sale_price: number;

    /* ---------- Status ---------- */

    is_active: boolean;

    /* ---------- Content ---------- */

    description: RichTextJSON | null;

    learning_outcomes: string[] | null;

    target_audience: string[] | null;

    /* ---------- Relations ---------- */

    instructors?: InstructorOption[];

    created_at: string;
};

/* ---------------- Rich Text ---------------- */

export type RichTextJSON = {
    type: string;
    attrs?: Record<string, unknown>;
    content?: RichTextJSON[];
    text?: string;
    marks?: {
        type: string;
        attrs?: Record<string, unknown>;
    }[];
};

/* ---------------- Course Form Values ---------------- */

export type CourseFormValueTypes = {
    title: string;
    subtitle?: string;
    thumbnail_image?: string | null;
    description?: RichTextJSON | null;

    /* ---------- Category ---------- */
    category: Category;
    board?: Board | null;

    /* ---------- Academic ---------- */
    class_level?: number | null;
    target_exam?: TargetExam | null;

    /* ---------- Arrays (UI format) ---------- */
    subjects?: { value: Subject }[];
    languages: Language[];

    /* ---------- Pricing ---------- */
    list_price: number;
    sale_price: number;

    /* ---------- Instructors ---------- */
    instructor_ids?: string[];

    /* ---------- Status ---------- */
    is_active: boolean;

    /* ---------- Marketing ---------- */
    learning_outcomes?: { value: string }[];
    target_audience?: { value: string }[];
};

/* ---------------- Instructor Option ---------------- */

export type InstructorOption = {
    id: string;
    full_name: string;
};
