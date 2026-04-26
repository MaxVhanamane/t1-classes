import { RefundReason } from "../zod/refund.schema";

export type Payment = {
    id: string;
    enrollment_id: string;

    amount: number;

    transaction_type:
    | "payment"
    | "refund";

    status:
    | "pending"
    | "success"
    | "failed";

    payment_method:
    | "cash"
    | "upi"
    | "card"
    | "netbanking"
    | "wallet"
    | "bank_transfer";

    payment_origin:
    | "admin"
    | "self_serve";

    paid_at: string;
    created_at: string;

    notes: string | null;

    refund_reason:
    RefundReason | null

    failure_reason:
    string | null;


    created_by: string | null;
};
