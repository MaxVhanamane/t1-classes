export interface AuditUser {
    id: string;
    fullName: string | null;
}


export interface EnrollmentStudent {
    id: string;

    fullName: string;

    phone: string | null;
}

export interface EnrollmentTarget {
    type: "course" | "batch";

    title: string;
}

export interface EnrollmentContext {
    id: string;

    student: EnrollmentStudent;

    target: EnrollmentTarget;
}


export interface EnrollmentPricing {
    targetType: "course" | "batch";

    title: string;

    listPrice: number;

    salePrice: number;
}

export interface EnrollmentFeePlan {
    id: string;

    enrollment_id: string;

    discount_amount: number;

    final_amount: number;

    list_price_at_creation: number;

    sale_price_at_creation: number;

    currency: string;

    status: "active" | "superseded";

    discount_reason: string | null;

    created_at: string;

    updated_at: string | null;

    created_by: AuditUser | null;

    updated_by: AuditUser | null;
}

export interface EnrollmentPayment {
    id: string;

    enrollment_id: string;

    amount: number;

    transaction_type: "payment" | "refund";

    status: "pending" | "success" | "failed";

    payment_method:
    | "cash"
    | "upi"
    | "card"
    | "netbanking"
    | "wallet"
    | "bank_transfer";

    payment_origin: "admin" | "self_serve";

    paid_at: string;

    created_at: string;

    notes: string | null;

    refund_reason: string | null;

    failure_reason: string | null;

    created_by: AuditUser | null;
}

export interface FeeStatus {
    final_amount: number;

    paid_amount: number;

    pending_amount: number;

    overpaid_amount: number;
}

export interface EnrollmentFeesData {
    enrollment: EnrollmentContext;

    pricing: EnrollmentPricing;

    payments: EnrollmentPayment[];

    activeFeePlan: EnrollmentFeePlan | null;

    feeHistory: EnrollmentFeePlan[];

    feeStatus: FeeStatus | null;
}
