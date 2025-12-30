import { getFeeData } from "../actions/queries";
import { CreateFeePlanDialog } from "./create-fee-plan-dialog";
import { SupersedeFeePlanDialog } from "./create-supersede-fee-plan";
import { EditFeePlanDialog } from "./edit-fee-plan-dialog";
import { CancelFeePlanDialog } from "./cancel-fee-plan-dialog";
import { FeePlanSummaryCard } from "./fee-plan-summary-card";
import { FeePlanHistoryList } from "./fee-plan-history-list";
import { PaymentsSection } from "./payment/payments-section";
import { Payment } from "../types/payment.types";
import { Separator } from "@/src/components/ui/separator";

interface Props {
  enrollmentId: string;
  pricing: {
    courseId: string;
    courseTitle: string;
    listPrice: number;
  };
  payments: Payment[];
}

export async function FeeSection({ enrollmentId, pricing, payments }: Props) {
  const { activeFeePlan, feeHistory, feeStatus } = await getFeeData(
    enrollmentId
  );

  const paymentsExist = feeStatus && feeStatus.paid_amount > 0;

  return (
    <div className="space-y-6">
      {/* ACTIVE FEE PLAN */}
      {activeFeePlan ? (
        <>
          <FeePlanSummaryCard
            totalAmount={activeFeePlan.total_amount}
            discountAmount={activeFeePlan.discount_amount}
            finalAmount={activeFeePlan.final_amount}
            effectiveFrom={activeFeePlan.effective_from}
            notes={activeFeePlan.notes}
            status={activeFeePlan.status}
            is_active={activeFeePlan.is_active}
            createdAt={activeFeePlan.created_at}
            createdBy={activeFeePlan.created_by}
            updatedAt={activeFeePlan.updated_at}
            updatedBy={activeFeePlan.updated_by}
            actions={
              paymentsExist ? (
                <SupersedeFeePlanDialog
                  enrollmentId={enrollmentId}
                  oldFeePlanId={activeFeePlan.id}
                  currentTotalAmount={activeFeePlan.total_amount}
                  currentDiscountAmount={activeFeePlan.discount_amount}
                  currentNotes={activeFeePlan.notes}
                />
              ) : (
                <div className="flex gap-2">
                  <EditFeePlanDialog feePlan={activeFeePlan} />
                  <CancelFeePlanDialog feePlanId={activeFeePlan.id} />
                </div>
              )
            }
          />

          {paymentsExist && (
            <p className="text-sm text-muted-foreground">
              Payments have been recorded. This fee plan cannot be edited or
              cancelled.
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
        /* NO ACTIVE FEE PLAN */
        <div className="rounded-md border p-6 space-y-4">
          <p className="text-sm text-muted-foreground">No active fee plan.</p>

          <CreateFeePlanDialog
            enrollmentId={enrollmentId}
            defaultTotalAmount={pricing.listPrice}
            courseTitle={pricing.courseTitle}
          />
        </div>
      )}

      {/* FEE PLAN HISTORY */}
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
