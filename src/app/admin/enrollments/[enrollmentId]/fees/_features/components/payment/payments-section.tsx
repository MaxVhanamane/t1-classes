import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

import { PaymentsList } from "./payments-list";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { RefundDialog } from "./refund-dialog";

import {
  EnrollmentPayment,
  FeeStatus,
} from "../../types/enrollment-fees-data.types";

interface PaymentsSectionProps {
  enrollmentId: string;

  feeStatus: FeeStatus | null;

  payments: EnrollmentPayment[];
}

export function PaymentsSection({
  enrollmentId,
  feeStatus,
  payments,
}: PaymentsSectionProps) {
  if (!feeStatus) {
    return null;
  }

  const total = Number(feeStatus.final_amount);

  const paid = Number(feeStatus.paid_amount);

  const pending = Number(feeStatus.pending_amount);

  const extraPaid = Number(feeStatus.overpaid_amount);

  const status =
    extraPaid > 0
      ? {
          label: "Overpaid",

          className:
            "bg-sky-100 text-sky-800 hover:bg-sky-100 border-transparent",
        }
      : pending === 0
        ? {
            label: "Fully paid",

            className:
              "bg-green-100 text-green-800 hover:bg-green-100 border-transparent",
          }
        : {
            label: "Pending payment",

            className:
              "bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent",
          };

  return (
    <div className="space-y-4 lg:max-w-xl">
      <h2 className="text-xl font-semibold">Payments</h2>

      <Card className="overflow-hidden">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Payment Summary
              </p>

              <p className="text-3xl font-semibold tracking-tight">
                ₹{total.toLocaleString()}
              </p>

              <p className="text-sm text-muted-foreground">
                Total payable under current fee plan
              </p>
            </div>

            <Badge
              variant="outline"
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${status.className}`}
            >
              {status.label}
            </Badge>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Paid" value={paid} />

            <MetricCard label="Pending" value={pending} />

            {extraPaid > 0 && <MetricCard label="Overpaid" value={extraPaid} />}
          </div>

          {/* Overpaid Notice */}
          {extraPaid > 0 && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium">
                ₹{extraPaid.toLocaleString()} paid extra
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                You can refund this amount or adjust it in future.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {paid > 0 && (
          <RefundDialog
            enrollmentId={enrollmentId}
            refundableAmount={extraPaid > 0 ? extraPaid : paid}
          />
        )}

        {pending > 0 && (
          <RecordPaymentDialog
            enrollmentId={enrollmentId}
            pendingAmount={pending}
          />
        )}
      </div>

      {/* History */}
      <h4 className="pt-2 text-sm font-medium text-muted-foreground">
        Payment History
      </h4>

      <PaymentsList payments={payments} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  muted = false,
}: {
  label: string;

  value: number;

  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-semibold ${
          muted ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        ₹{value.toLocaleString()}
      </p>
    </div>
  );
}
