import type {
    Category as BatchCategory,
    Location as BatchLocation,
    Board as BatchBoard,
    TargetExam as BatchTargetExam,
    Language as BatchLanguage,
    Subject as BatchSubjectEnum,
} from "../zod-schema/schema";

/* ---------------- Batch Marketing ---------------- */

export type BatchLearningOutcome = {
    value: string;
};

export type BatchTargetAudience = {
    value: string;
};

export type BatchSubject = {
    value: BatchSubjectEnum;
};

/* ---------------- Core Enums ---------------- */

export type BatchMode =
    | "offline"
    | "online"
    | "hybrid";

/* ---------------- Batch List ---------------- */

export type BatchListItem = {
    /* ---------- Identity ---------- */
    id: string;
    title: string;
    slug: string;

    /* ---------- Basic Info ---------- */
    subtitle: string | null;
    description: Record<string, unknown> | null;

    /* ---------- Category ---------- */
    category: BatchCategory;
    board: BatchBoard | null;

    /* ---------- Academic Metadata ---------- */
    subjects: BatchSubjectEnum[] | null;
    class_level: number | null;
    target_exam: BatchTargetExam | null;

    /* ---------- Pricing ---------- */
    sale_price: number;
    list_price: number;

    /* ---------- Media ---------- */
    thumbnail_image: string | null;

    /* ---------- Delivery ---------- */
    mode: BatchMode;

    /* ---------- Visibility ---------- */
    is_active: boolean;
    is_admission_open: boolean;

    /* ---------- Location ---------- */
    location: BatchLocation | null;
    address: string | null;
    languages: BatchLanguage[];

    /* ---------- Lifecycle Dates ---------- */
    start_date: string;
    end_date: string;

    /* ---------- Capacity ---------- */
    capacity: number | null;

    /* ---------- Marketing ---------- */
    learning_outcomes: string[] | null;
    target_audience: string[] | null;

    /* ---------- Relations ---------- */
    courses: {
        course: {
            id: string;
            title: string;
        };
    }[];

    instructors?: {
        id: string;
        full_name: string;
    }[];
};

/* ---------------- Edit State ---------------- */

export type BatchEditState =
    | "unlocked"
    | "locked";

/* ---------------- Dialog Props ---------------- */

export type BatchDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch?: BatchListItem;
    courses: CourseSelectItem[];
};

/* ---------------- Course Selector ---------------- */

export interface CourseSelectItem {
    id: string;
    title: string;
    is_active: boolean;
}
