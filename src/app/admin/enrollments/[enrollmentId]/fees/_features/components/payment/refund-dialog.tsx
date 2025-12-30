"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";

import {
  refundFormSchema,
  refundSubmitSchema,
  RefundFormInput,
} from "../../zod/refund.schema";

import { MoneyInput } from "../money-input";

import { ConfirmRefundDialog } from "./confirm-refund-dialog";
import { createRefund } from "../../actions/payments/create-refund";

import { PaymentMethodSelect } from "./payment-method-select";

interface Props {
  enrollmentId: string;
  refundableAmount: number;
}

export function RefundDialog({ enrollmentId, refundableAmount }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<RefundFormInput>({
    resolver: zodResolver(refundFormSchema),
    mode: "onChange",
    defaultValues: {
      amount: "",
      refundedAt: new Date().toISOString().slice(0, 10),
      paymentMethod: "",
      reason: "",
      notes: "",
    },
  });

  /** Reset form every time dialog opens */
  useEffect(() => {
    if (open) {
      form.reset({
        amount: "",
        refundedAt: new Date().toISOString().slice(0, 10),
        paymentMethod: "",
        reason: "",
        notes: "",
      });
    }
  }, [open, form]);

  /** useWatch instead of form.watch */
  const amountValue = Number(
    useWatch({ control: form.control, name: "amount" }) || 0
  );

  const reasonValue = useWatch({ control: form.control, name: "reason" }) ?? "";

  const isOverRefunding = amountValue > refundableAmount;

  const { isDirty, isValid, errors, touchedFields, submitCount } =
    form.formState;

  /** Step 1: open confirmation modal */
  function onSubmit() {
    setConfirmOpen(true);
  }

  /** Step 2: confirm and create refund */
  async function confirmRefund() {
    setLoading(true);

    try {
      const data = form.getValues();

      const parsed = refundSubmitSchema.parse({
        amount: Number(data.amount),
        refundedAt: data.refundedAt,
        paymentMethod: data.paymentMethod,
        reason: data.reason,
        notes: data.notes,
      });

      await createRefund(enrollmentId, parsed);

      toast.success("Refund recorded successfully");

      setConfirmOpen(false);
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to record refund.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const showError =
    errors.reason &&
    (submitCount > 0 || (touchedFields.reason && reasonValue.length === 0));

  const showHelper =
    !showError && reasonValue.length > 0 && reasonValue.length < 3;

  return (
    <>
      {/* Trigger */}
      <Button
        variant="outline"
        className="cursor-pointer mr-2"
        onClick={() => setOpen(true)}
        disabled={refundableAmount <= 0}
      >
        Issue Refund
      </Button>

      {/* Refund Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Record a refund issued for this enrollment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Refund Amount */}
            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <MoneyInput
                placeholder="e.g. 3000"
                {...form.register("amount")}
              />
              {errors.amount && touchedFields.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Refundable amount: ₹{refundableAmount.toLocaleString()}
              </p>
              {isOverRefunding && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Refund exceeds refundable balance. Proceed only if
                    intentional.
                  </p>
                </div>
              )}
            </div>

            {/* Refund Date */}
            <div className="space-y-2">
              <Label>Refund Date</Label>
              <input
                type="date"
                {...form.register("refundedAt")}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Refund Method */}
            <div className="space-y-2">
              <PaymentMethodSelect
                control={form.control}
                name="paymentMethod"
                label="Refund Method"
              />

              {errors.paymentMethod && touchedFields.paymentMethod && (
                <p className="text-xs text-destructive">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            {/* Refund Reason */}
            <div className="space-y-2">
              <Label>Refund Reason</Label>
              <Textarea
                placeholder="Required reason for refund"
                {...form.register("reason")}
              />
              <p
                className={`
                  min-h-4 text-xs transition-opacity
                  ${showError || showHelper ? "opacity-100" : "opacity-0"}
                  ${showError ? "text-destructive" : "text-muted-foreground"}
                `}
              >
                {showError
                  ? errors.reason?.message
                  : showHelper
                  ? "Minimum 3 characters required"
                  : ""}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Optional additional context"
                {...form.register("notes")}
              />
            </div>

            <Separator />

            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                variant="destructive"
                disabled={loading || !isDirty || !isValid}
              >
                Review Refund
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmRefundDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmRefund}
        amount={amountValue}
        loading={loading}
      />
    </>
  );
}
