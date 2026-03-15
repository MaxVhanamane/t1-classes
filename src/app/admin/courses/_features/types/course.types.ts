export type CourseInstructor = {
    id: string;
    course_id: string;
    user_id: string | null;
    name: string;
    qualification: string | null;
    bio: string | null;
    avatar_url: string | null;
};


export type RichTextJSON = {
    type: string
    attrs?: Record<string, unknown>
    content?: RichTextJSON[]
    text?: string
    marks?: {
        type: string
        attrs?: Record<string, unknown>
    }[]
}

export type CourseFormValueTypes = {
    title: string;
    subtitle?: string;

    thumbnail_image?: string | null;

    description?: RichTextJSON | null;

    course_type: "academic" | "foundation" | "exam" | "crash";

    class_level?: number | null;

    board?: string;

    target_exam?: string;

    /* ---------- Arrays (UI format) ---------- */

    subjects?: { value: string }[];

    languages: { value: string }[];

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



export type InstructorOption = {
    id: string;
    full_name: string;
};
