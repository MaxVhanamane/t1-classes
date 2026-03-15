/* ---------------- Batch Marketing ---------------- */
export type BatchLearningOutcome = {
    value: string;
};

export type BatchTargetAudience = {
    value: string;
};

export type BatchSubject = {
    value: string;
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
    description: Record<string, unknown> | null; // TipTap JSONB

    /* ---------- Academic Metadata ---------- */
    subjects: string[] | null;
    class_level: number | null;
    target_exam: string | null;

    /* ---------- Pricing ---------- */
    sale_price: number;
    list_price: number; // now NOT NULL

    /* ---------- Media ---------- */
    thumbnail_image: string | null;

    /* ---------- Delivery ---------- */
    mode: BatchMode;

    /* ---------- Visibility ---------- */
    is_active: boolean;
    is_admission_open: boolean;

    /* ---------- Location ---------- */
    location: string | null;
    languages: string[];

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
    batch?: BatchListItem; // undefined = create
    courses: CourseSelectItem[];
};

/* ---------------- Course Selector ---------------- */

export interface CourseSelectItem {
    id: string;
    title: string;
    is_active: boolean;
}
