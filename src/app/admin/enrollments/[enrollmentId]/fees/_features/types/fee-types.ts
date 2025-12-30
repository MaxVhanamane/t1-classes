export type EnrollmentResult = {
    id: string
    target_type: 'course' | 'batch'
    course: {
        id: string
        title: string
        price: number
    } | null
    batch: {
        id: string
        name: string
        course: {
            id: string
            title: string
            price: number
        }
    } | null
}



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

    // audit (IDs only, lazy-resolved if needed)
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

    // audit (IDs only)
    created_by: string;
    updated_by: string | null;
};
