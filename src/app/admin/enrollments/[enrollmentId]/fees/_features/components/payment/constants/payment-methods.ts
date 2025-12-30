import {
    Banknote,
    CreditCard,
    Smartphone,
    Landmark,
    Wallet,
} from "lucide-react";

export const PAYMENT_METHODS = [
    {
        value: "cash",
        label: "Cash",
        icon: Banknote,
    },
    {
        value: "upi",
        label: "UPI",
        icon: Smartphone,
    },
    {
        value: "card",
        label: "Card",
        icon: CreditCard,
    },
    {
        value: "netbanking",
        label: "Netbanking",
        icon: Landmark,
    },
    {
        value: "wallet",
        label: "Wallet",
        icon: Wallet,
    },
    {
        value: "bank_transfer",
        label: "Bank Transfer",
        icon: Landmark,
    },
] as const;

export type PaymentMethod =
    (typeof PAYMENT_METHODS)[number]["value"];
