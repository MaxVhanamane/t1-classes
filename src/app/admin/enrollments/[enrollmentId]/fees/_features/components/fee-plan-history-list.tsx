import { format } from "date-fns";

import { Separator } from "@/src/components/ui/separator";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

import { EnrollmentFeePlan } from "../types/enrollment-fees-data.types";

interface FeePlanHistoryListProps {
  feePlans: EnrollmentFeePlan[];
}

const statusStyles = {
  superseded: "bg-yellow-100 text-yellow-800",
};

export function FeePlanHistoryList({ feePlans }: FeePlanHistoryListProps) {
  if (!feePlans.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">
        Fee Plan History
      </h4>

      <div className="rounded-lg border lg:max-w-xl">
        <Accordion type="multiple" className="divide-y">
          {feePlans.map((plan) => {
            const standardDiscount =
              plan.list_price_at_creation - plan.sale_price_at_creation;

            return (
              <AccordionItem key={plan.id} value={plan.id} className="px-4">
                <AccordionTrigger className="py-3 text-sm">
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">
                        ₹{plan.final_amount.toLocaleString()}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        Created{" "}
                        {format(new Date(plan.created_at), "dd MMM yyyy")}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        statusStyles.superseded
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4">
                  <div className="space-y-3 text-sm">
                    {/* Pricing Snapshot */}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">List Price</span>

                      <span>
                        ₹{plan.list_price_at_creation.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sale Price</span>

                      <span>
                        ₹{plan.sale_price_at_creation.toLocaleString()}
                      </span>
                    </div>

                    {standardDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Standard Discount
                        </span>

                        <span>− ₹{standardDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <Separator />

                    {/* Fee Plan */}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>

                      <span className="text-destructive">
                        − ₹{plan.discount_amount.toLocaleString()}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-medium">
                      <span>Final Payable</span>

                      <span>₹{plan.final_amount.toLocaleString()}</span>
                    </div>

                    {/* Discount Reason */}
                    {plan.discount_reason && (
                      <>
                        <Separator />

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Discount Reason
                          </p>

                          <p className="leading-relaxed capitalize">
                            {plan.discount_reason.replaceAll("_", " ")}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Audit */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>
                        Created on{" "}
                        {format(
                          new Date(plan.created_at),
                          "dd MMM yyyy, hh:mm a",
                        )}
                        {plan.created_by && (
                          <>
                            {" "}
                            by{" "}
                            <span className="font-medium text-foreground">
                              {plan.created_by.fullName ?? "Unknown"}
                            </span>
                          </>
                        )}
                      </p>

                      {plan.updated_at && (
                        <p>
                          Updated on{" "}
                          {format(
                            new Date(plan.updated_at),
                            "dd MMM yyyy, hh:mm a",
                          )}
                          {plan.updated_by && (
                            <>
                              {" "}
                              by{" "}
                              <span className="font-medium text-foreground">
                                {plan.updated_by.fullName ?? "Unknown"}
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
