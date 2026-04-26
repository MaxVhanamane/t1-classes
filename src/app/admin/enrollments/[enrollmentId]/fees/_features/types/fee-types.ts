export type EnrollmentResult = {
    id: string;
    target_type:
    | "course"
    | "batch";

    /** Present when target_type === "course" */
    course: {
        id: string;
        title: string;
        list_price: number;
        sale_price: number;
    } | null;

    /** Present when target_type === "batch" */
    batch: {
        id: string;
        title: string;
        list_price: number;
        sale_price: number;

        batch_courses: {
            course: {
                id: string;
                title: string;
                list_price: number;
                sale_price: number;
            } | null;
        }[];
    } | null;
};

export type FeePlanRow = {
    id: string;
    enrollment_id: string;

    offered_amount: number;
    discount_amount: number;
    final_amount: number;

    list_price_at_creation: number;
    sale_price_at_creation: number;

    currency: string;

    status:
    | "active"
    | "superseded";


    discount_reason:
    | string
    | null;

    created_at: string;
    updated_at:
    | string
    | null;

    created_by: string;
    updated_by:
    | string
    | null;
};

export type FeePlanHistoryRow = {
    id: string;

    offered_amount: number;
    discount_amount: number;
    final_amount: number;

    list_price_at_creation: number;
    sale_price_at_creation: number;

    currency: string;

    status: "superseded";

    discount_reason:
    | string
    | null;

    created_at: string;
    updated_at:
    | string
    | null;

    created_by: string;
    updated_by:
    | string
    | null;
};

export type EnrollmentPricingContext =
    {
        targetType:
        | "course"
        | "batch";

        title: string;

        listPrice: number;
        salePrice: number;
    };
