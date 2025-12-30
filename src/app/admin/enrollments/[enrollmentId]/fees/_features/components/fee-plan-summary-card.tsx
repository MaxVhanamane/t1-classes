import { format } from "date-fns";
import { Children } from "react";
import { FeePlanAuditTrigger } from "./fee-plan-audit-trigger";

type FeePlanSummaryCardProps = {
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  effectiveFrom: string;
  status: "active" | "cancelled" | "superseded";
  is_active: boolean;
  notes: string | null;

  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;

  actions?: React.ReactNode;
};

export function FeePlanSummaryCard({
  totalAmount,
  discountAmount,
  finalAmount,
  effectiveFrom,
  status,
  is_active,
  notes,
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  actions,
}: FeePlanSummaryCardProps) {
  const statusStyles = {
    active: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    superseded: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="text-sm font-semibold">Fee Plan Summary</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-6 px-6 py-5">
        {/* Amounts */}
        <div className="space-y-2 text-sm">
          <Row label="Total Amount">₹ {totalAmount.toLocaleString()}</Row>
          <Row label="Discount" destructive>
            − ₹ {discountAmount.toLocaleString()}
          </Row>
        </div>

        {/* Final Amount */}
        <div className="rounded-lg bg-muted/50 px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">Final Amount</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            ₹ {finalAmount.toLocaleString()}
          </p>
        </div>

        {/* Meta */}
        <div className="space-y-2 text-sm">
          <Row label="Effective From">
            {format(new Date(effectiveFrom), "dd MMM yyyy")}
          </Row>

          <Row label="Plan Active">
            <span
              className={`font-medium ${
                is_active ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              {is_active ? "Yes" : "No"}
            </span>
          </Row>
        </div>

        {/* Notes */}
        {notes && (
          <div className="border-t pt-4 text-sm space-y-1">
            <p className="text-muted-foreground">Notes</p>
            <p className="leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Audit (lazy) */}
        <div className="border-t pt-4 space-y-1 text-xs text-muted-foreground">
          <p>
            Created on{" "}
            <span className="font-medium text-foreground">
              {format(new Date(createdAt), "dd MMM yyyy")}
            </span>
          </p>

          {updatedAt && (
            <p>
              Last updated on{" "}
              <span className="font-medium text-foreground">
                {format(new Date(updatedAt), "dd MMM yyyy")}
              </span>
            </p>
          )}

          <FeePlanAuditTrigger createdBy={createdBy} updatedBy={updatedBy} />
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex justify-end gap-4 border-t bg-muted/20 px-6 py-4 text-sm">
          {Children.map(actions, (action) => (
            <div className="shrink-0">{action}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Clean reusable row */
function Row({
  label,
  children,
  destructive = false,
}: {
  label: string;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium ${
          destructive ? "text-destructive" : "text-foreground"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
