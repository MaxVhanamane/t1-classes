import type { Payment } from "../../types/payment.types";
import { PaymentStatusBadge } from "./payment-status-badge";
import { PaymentMethodBadge } from "./payment-method-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface PaymentsListProps {
  payments: Payment[];
}

export function PaymentsList({ payments }: PaymentsListProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        No payments recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border divide-y">
      {payments.map((payment) => {
        const isRefund = payment.amount < 0;

        const processedByLabel = isRefund ? "Refund issued by" : "Processed by";

        return (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 text-sm"
          >
            {/* LEFT */}
            <div className="space-y-1">
              {/* Amount */}
              <div className="font-medium">
                {isRefund ? (
                  <span className="text-red-600">
                    −₹{Math.abs(payment.amount).toLocaleString()}
                  </span>
                ) : (
                  <span>₹{payment.amount.toLocaleString()}</span>
                )}

                {isRefund && (
                  <span className="ml-2 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    Refund
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <PaymentMethodBadge method={payment.payment_method} />
                <span>·</span>
                <span>{new Date(payment.paid_at).toLocaleDateString()}</span>
              </div>

              {/* Processed by */}
              {payment.processed_by_user_name && (
                <div className="text-xs text-muted-foreground">
                  {processedByLabel}{" "}
                  <span className="font-medium text-foreground">
                    {payment.processed_by_user_name}
                  </span>
                </div>
              )}

              {/* Notes */}
              {payment.notes && (
                <div className="text-xs text-muted-foreground">
                  {payment.notes}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
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
