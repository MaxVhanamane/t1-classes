import { getFeeData } from "../actions/queries";
import { CreateFeePlanDialog } from "./create-fee-plan-dialog";
import { SupersedeFeePlanDialog } from "./create-supersede-fee-plan";
import { EditFeePlanDialog } from "./edit-fee-plan-dialog";
import { FeePlanSummaryCard } from "./fee-plan-summary-card";
import { FeePlanHistoryList } from "./fee-plan-history-list";
import { PaymentsSection } from "./payment/payments-section";
import { Payment } from "../types/payment.types";
import { EnrollmentPricingContext } from "../types/fee-types";
import { Separator } from "@/src/components/ui/separator";
import { DeleteFeePlanDialog } from "./delete-fee-plan-dialog";

interface Props {
  enrollmentId: string;
  pricing: EnrollmentPricingContext;
  payments: Payment[];
}

export async function FeeSection({ enrollmentId, pricing, payments }: Props) {
  const { activeFeePlan, feeHistory, feeStatus } =
    await getFeeData(enrollmentId);

  const paymentsExist = (feeStatus?.paid_amount ?? 0) > 0;

  return (
    <div className="space-y-6">
      {activeFeePlan ? (
        <>
          <FeePlanSummaryCard
            offeredAmount={activeFeePlan.offered_amount}
            discountAmount={activeFeePlan.discount_amount}
            finalAmount={activeFeePlan.final_amount}
            listPriceAtCreation={activeFeePlan.list_price_at_creation}
            salePriceAtCreation={activeFeePlan.sale_price_at_creation}
            currency={activeFeePlan.currency}
            discountReason={activeFeePlan.discount_reason}
            status={activeFeePlan.status}
            createdAt={activeFeePlan.created_at}
            createdBy={activeFeePlan.created_by}
            updatedAt={activeFeePlan.updated_at}
            updatedBy={activeFeePlan.updated_by}
            actions={
              paymentsExist ? (
                <SupersedeFeePlanDialog
                  enrollmentId={enrollmentId}
                  oldFeePlanId={activeFeePlan.id}
                  currentOfferedAmount={activeFeePlan.offered_amount}
                  currentDiscountAmount={activeFeePlan.discount_amount}
                  currentDiscountReason={activeFeePlan.discount_reason}
                />
              ) : (
                <div className="flex gap-2">
                  <EditFeePlanDialog feePlan={activeFeePlan} />
                  <DeleteFeePlanDialog feePlanId={activeFeePlan.id} />
                </div>
              )
            }
          />

          {paymentsExist && (
            <p className="text-sm text-muted-foreground">
              Payments have been recorded. This fee plan cannot be edited or
              deleted.
            </p>
          )}

          <Separator className="my-4" />

          <PaymentsSection
            enrollmentId={enrollmentId}
            feeStatus={feeStatus}
            payments={payments}
          />

          <Separator className="my-4" />
        </>
      ) : (
        <div className="space-y-4 rounded-md border p-6">
          <p className="text-sm text-muted-foreground">No active fee plan.</p>

          <CreateFeePlanDialog
            enrollmentId={enrollmentId}
            title={pricing.title}
            listPrice={pricing.listPrice}
            salePrice={pricing.salePrice}
          />
        </div>
      )}

      {feeHistory.length > 0 ? (
        <FeePlanHistoryList feePlans={feeHistory} />
      ) : (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Fee plan history will appear here once changes are made.
        </div>
      )}
    </div>
  );
}
