import { cn } from "@/src/lib/utils";

type PaymentStatus = "pending" | "success" | "failed" | "reversed";

interface Props {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: Props) {
  const config: Record<PaymentStatus, { label: string; className: string }> = {
    success: {
      label: "Success",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    failed: {
      label: "Failed",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    reversed: {
      label: "Reversed",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}
