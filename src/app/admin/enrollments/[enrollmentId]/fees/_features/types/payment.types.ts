export type Payment = {
    id: string;
    enrollment_id: string;

    amount: number;
    status: "pending" | "success" | "failed" | "reversed";

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
    failure_reason: string | null;

    processed_by_user_name: string | null;
};
