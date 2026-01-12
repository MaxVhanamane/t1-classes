export type EnrollmentResult = {
    id: string;
    target_type: "course" | "batch";

    /** Present when target_type === "course" */
    course: {
        id: string;
        title: string;
        price: number;
    } | null;

    /** Present when target_type === "batch" */
    batch: {
        id: string;
        name: string;

        batch_courses: {
            course: {
                id: string;
                title: string;
                price: number;
            } | null;
        }[];
    } | null;
};


export type FeePlanRow = {
    id: string;
    enrollment_id: string;

    total_amount: number;
    discount_amount: number;
    final_amount: number;

    effective_from: string;
    status: "active" | "cancelled" | "superseded";
    is_active: boolean;

    notes: string | null;

    created_at: string;
    updated_at: string | null;

    created_by: string;
    updated_by: string | null;
};

export type FeePlanHistoryRow = {
    id: string;

    total_amount: number;
    discount_amount: number;
    final_amount: number;

    effective_from: string;
    status: "superseded" | "cancelled";

    notes: string | null;

    created_at: string;
    updated_at: string | null;

    created_by: string;
    updated_by: string | null;
};

export type EnrollmentPricingContext = {
    targetType: "course" | "batch";
    title: string;
    listPrice: number;
};
