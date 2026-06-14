import { format } from "date-fns";
import { Children } from "react";

import { Badge } from "@/src/components/ui/badge";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

import { AuditUser } from "../types/enrollment-fees-data.types";

type FeePlanSummaryCardProps = {
  discountAmount: number;

  finalAmount: number;

  listPriceAtCreation: number;

  salePriceAtCreation: number;

  currency?: string;

  status: "active" | "superseded";

  discountReason: string | null;

  createdAt: string;

  createdBy: AuditUser | null;

  updatedAt: string | null;

  updatedBy: AuditUser | null;

  actions?: React.ReactNode;
};

const reasonLabels: Record<string, string> = {
  scholarship: "Scholarship",
  sibling_discount: "Sibling discount",
  retention_offer: "Retention offer",
  staff_reference: "Staff reference",
  promotional_offer: "Promotional offer",
  management_approval: "Management approval",
};

export function FeePlanSummaryCard({
  discountAmount,
  finalAmount,
  listPriceAtCreation,
  salePriceAtCreation,
  currency = "INR",
  status,
  discountReason,
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  actions,
}: FeePlanSummaryCardProps) {
  const symbol = currency === "INR" ? "₹" : `${currency} `;

  const standardDiscount = listPriceAtCreation - salePriceAtCreation;

  const statusStyles = {
    active: "bg-green-100 text-green-700 hover:bg-green-100",

    superseded: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  };

  const reasonLabel = discountReason
    ? (reasonLabels[discountReason] ?? discountReason.replaceAll("_", " "))
    : null;

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="text-sm font-semibold">Fee Plan Summary</h3>

        <Badge
          variant="secondary"
          className={`capitalize ${statusStyles[status]}`}
        >
          {status}
        </Badge>
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-5">
        {/* Pricing Snapshot */}
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-xl border bg-muted/25 px-4"
        >
          <AccordionItem value="pricing" className="border-none">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              Original Pricing Snapshot
            </AccordionTrigger>

            <AccordionContent className="pb-4">
              <div className="space-y-2 text-sm">
                <Row label="List Price">
                  {symbol}
                  {listPriceAtCreation.toLocaleString()}
                </Row>

                <Row label="Sale Price">
                  {symbol}
                  {salePriceAtCreation.toLocaleString()}
                </Row>

                {standardDiscount > 0 && (
                  <Row label="Standard Discount">
                    − {symbol}
                    {standardDiscount.toLocaleString()}
                  </Row>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Fee rows */}
        {/* Fee rows */}
        <div className="space-y-2 text-sm">
          <Row label="Sale Amount">
            {symbol}
            {salePriceAtCreation.toLocaleString()}
          </Row>

          <Row label="Extra Discount" destructive>
            − {symbol}
            {discountAmount.toLocaleString()}
          </Row>
        </div>

        {/* Final */}
        <div className="rounded-xl bg-muted/50 px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">Final Payable</p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {symbol}
            {finalAmount.toLocaleString()}
          </p>
        </div>

        {/* Reason */}
        {reasonLabel && (
          <div className="space-y-1 border-t pt-4 text-sm">
            <p className="text-muted-foreground">Discount Reason</p>

            <p className="leading-relaxed capitalize">{reasonLabel}</p>
          </div>
        )}

        {/* Audit */}
        <div className="space-y-1 border-t pt-4 text-xs text-muted-foreground">
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

          <div className="space-y-1 pt-2">
            {createdBy && (
              <p>
                Created by{" "}
                <span className="font-medium text-foreground">
                  {createdBy.fullName ?? "Unknown"}
                </span>
              </p>
            )}

            {updatedBy && (
              <p>
                Updated by{" "}
                <span className="font-medium text-foreground">
                  {updatedBy.fullName ?? "Unknown"}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>

      <span
        className={`text-right font-medium ${
          destructive ? "text-destructive" : "text-foreground"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
