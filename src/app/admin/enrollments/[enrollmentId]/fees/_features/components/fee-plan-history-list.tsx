import { format } from "date-fns";
import { Separator } from "@/src/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { FeePlanHistoryRow } from "../types/fee-types";
import { FeePlanAuditTrigger } from "./fee-plan-audit-trigger";

interface FeePlanHistoryListProps {
  feePlans: FeePlanHistoryRow[];
}

const statusStyles: Record<FeePlanHistoryRow["status"], string> = {
  superseded: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

export function FeePlanHistoryList({ feePlans }: FeePlanHistoryListProps) {
  if (!feePlans.length) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">
        Fee Plan History
      </h4>

      <div className="rounded-lg border lg:max-w-xl">
        <Accordion type="multiple" className="divide-y">
          {feePlans.map((plan) => (
            <AccordionItem key={plan.id} value={plan.id} className="px-4">
              <AccordionTrigger className="py-3 text-sm">
                <div className="flex w-full items-center justify-between gap-4">
                  {/* Amount + Effective Date */}
                  <div className="flex flex-col text-left">
                    <span className="font-medium">
                      ₹{plan.final_amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Effective{" "}
                      {format(new Date(plan.effective_from), "dd MMM yyyy")}
                    </span>
                  </div>

                  {/* Status */}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      statusStyles[plan.status]
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-4">
                <div
                  className={`space-y-3 text-sm ${
                    plan.status === "cancelled" ? "opacity-70" : ""
                  }`}
                >
                  {/* Breakdown */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span>₹{plan.total_amount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-destructive">
                      − ₹{plan.discount_amount.toLocaleString()}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-medium">
                    <span>Final Amount</span>
                    <span>₹{plan.final_amount.toLocaleString()}</span>
                  </div>

                  {/* Notes */}
                  {plan.notes && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="leading-relaxed">{plan.notes}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Metadata */}
                  <p className="text-xs text-muted-foreground">
                    Created on{" "}
                    {format(new Date(plan.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>

                  {plan.status === "cancelled" && (
                    <p className="text-xs text-muted-foreground">
                      This fee plan was cancelled before any payments were made.
                    </p>
                  )}
                </div>

                {/* Audit (lazy) */}
                <div className="border-t pt-3 text-xs text-muted-foreground">
                  <FeePlanAuditTrigger
                    createdBy={plan.created_by}
                    updatedBy={plan.updated_by}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
