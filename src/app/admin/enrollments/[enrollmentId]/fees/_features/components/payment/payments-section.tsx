import { PaymentsList } from "./payments-list";
import { Card } from "@/src/components/ui/card";
import { Payment } from "../../types/payment.types";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { RefundDialog } from "./refund-dialog";

interface PaymentsSectionProps {
  enrollmentId: string;
  feeStatus: {
    final_amount: number;
    paid_amount: number;
    pending_amount: number;
  } | null;
  payments: Payment[];
}

export async function PaymentsSection({
  enrollmentId,
  feeStatus,
  payments,
}: PaymentsSectionProps) {
  if (!feeStatus) return null;

  const isFullyPaid = feeStatus.pending_amount <= 0;

  return (
    <div className="space-y-4 lg:max-w-xl">
      <h2 className="text-xl font-semibold">Payment</h2>

      {/* SUMMARY */}
      <Card className="w-full">
        <div className="flex items-center justify-between p-5">
          {/* Left */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payment Summary
            </p>

            <div className="flex items-center gap-6">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p
                  className={`text-base font-semibold ${
                    isFullyPaid ? "text-green-600" : "text-foreground"
                  }`}
                >
                  ₹{feeStatus.paid_amount.toLocaleString()}
                </p>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p
                  className={`text-base font-semibold ${
                    feeStatus.pending_amount > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  ₹{feeStatus.pending_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              isFullyPaid
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isFullyPaid ? "Fully paid" : "Pending payment"}
          </span>
        </div>
      </Card>

      <RefundDialog
        enrollmentId={enrollmentId}
        refundableAmount={feeStatus.paid_amount}
      />

      {/* ACTION */}
      <RecordPaymentDialog
        enrollmentId={enrollmentId}
        pendingAmount={feeStatus.pending_amount}
      />

      {/* LIST */}
      <h4 className="text-sm font-medium text-muted-foreground">
        Payment History
      </h4>
      <PaymentsList payments={payments} />
    </div>
  );
}
