import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { PaymentMethodBadge } from "./payment-method-badge";
import { PaymentStatusBadge } from "./payment-status-badge";

import { EnrollmentPayment } from "../../types/enrollment-fees-data.types";

interface PaymentsListProps {
  payments: EnrollmentPayment[];
}

const refundReasonLabels: Record<
  NonNullable<EnrollmentPayment["refund_reason"]>,
  string
> = {
  overpayment: "Overpayment",

  duplicate_payment: "Duplicate payment",

  entry_error: "Incorrect payment entry",

  service_issue: "Service issue",

  course_withdrawal: "Student withdrew",

  batch_cancelled: "Batch cancelled",

  special_approval: "Special approval",
};

export function PaymentsList({ payments }: PaymentsListProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        No payments recorded yet.
      </div>
    );
  }

  return (
    <div className="divide-y rounded-md border">
      {payments.map((payment) => {
        const isRefund = payment.transaction_type === "refund";

        const amount = Math.abs(payment.amount);

        const processedByLabel = isRefund ? "Refund issued by" : "Processed by";

        const actor = payment.created_by;

        const refundLabel = payment.refund_reason
          ? refundReasonLabels[payment.refund_reason]
          : null;

        return (
          <div
            key={payment.id}
            className="
              flex items-start justify-between
              gap-4 p-4 text-sm
            "
          >
            {/* LEFT */}
            <div className="min-w-0 space-y-1.5">
              {/* Amount */}
              <div className="flex flex-wrap items-center gap-2">
                {isRefund ? (
                  <span className="font-semibold text-red-500">
                    −₹
                    {amount.toLocaleString()}
                  </span>
                ) : (
                  <span className="font-semibold text-foreground">
                    ₹{amount.toLocaleString()}
                  </span>
                )}

                {isRefund && (
                  <Badge variant="secondary" className="text-red-500">
                    Refund
                  </Badge>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <PaymentMethodBadge method={payment.payment_method} />

                <span>·</span>

                <span>{new Date(payment.paid_at).toLocaleDateString()}</span>
              </div>

              {/* Refund reason */}
              {isRefund && refundLabel && (
                <div className="text-xs text-muted-foreground">
                  Reason:{" "}
                  <span className="font-medium text-foreground">
                    {refundLabel}
                  </span>
                </div>
              )}

              {/* Processed by */}
              {actor && (
                <div className="text-xs text-muted-foreground">
                  {processedByLabel}{" "}
                  <span className="font-medium text-foreground">
                    {actor.fullName ?? "Unknown"}
                  </span>
                </div>
              )}

              {/* Notes */}
              {!isRefund && payment.notes && (
                <div className="text-xs text-muted-foreground">
                  {payment.notes}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="shrink-0">
              {payment.status === "failed" && payment.failure_reason ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="left" className="max-w-xs text-sm">
                      {payment.failure_reason}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <PaymentStatusBadge status={payment.status} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
