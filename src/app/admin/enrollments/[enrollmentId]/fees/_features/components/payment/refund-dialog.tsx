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
import { Separator } from "@/src/components/ui/separator";

import {
  refundFormSchema,
  refundSubmitSchema,
  RefundFormInput,
  refundReasonOptions,
} from "../../zod/refund.schema";

import { MoneyInput } from "../money-input";
import { ConfirmRefundDialog } from "./confirm-refund-dialog";
import { createRefund } from "../../actions/payments/create-refund";
import { PaymentMethodSelect } from "./payment-method-select";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  enrollmentId: string;
  refundableAmount: number;
}

export function RefundDialog({ enrollmentId, refundableAmount }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const form = useForm<RefundFormInput>({
    resolver: zodResolver(refundFormSchema),
    mode: "onChange",
    defaultValues: {
      amount: "",
      refundedAt: new Date().toISOString().slice(0, 10),
      paymentMethod: "",
      refundReason: undefined,
    },
  });

  /**
   * Reset each open
   */
  useEffect(() => {
    if (open) {
      form.reset({
        amount: "",
        refundedAt: new Date().toISOString().slice(0, 10),
        paymentMethod: "",
        refundReason: undefined,
      });
    }
  }, [open, form]);

  const amountValue = Number(
    useWatch({
      control: form.control,
      name: "amount",
    }) || 0,
  );

  const refundReasonValue = useWatch({
    control: form.control,
    name: "refundReason",
  });

  const isOverRefunding = amountValue > refundableAmount;

  const { isDirty, isValid, errors, touchedFields } = form.formState;

  function onSubmit() {
    setConfirmOpen(true);
  }

  async function confirmRefund() {
    setLoading(true);

    try {
      const data = form.getValues();

      const parsed = refundSubmitSchema.parse({
        amount: Number(data.amount),

        refundedAt: data.refundedAt,

        paymentMethod: data.paymentMethod,

        refundReason: data.refundReason,
      });

      const { error } = await callServerAction(
        createRefund(enrollmentId, parsed),
      );

      if (error) {
        toast.error(error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["enrollment-fees", enrollmentId],
      });

      setConfirmOpen(false);

      setOpen(false);

      toast.success("Refund recorded successfully");
    } catch {
      toast.error("Failed to record refund.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="mr-2 cursor-pointer"
        onClick={() => setOpen(true)}
        disabled={refundableAmount <= 0}
      >
        Issue Refund
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>

            <DialogDescription>
              Record a refund issued for this enrollment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Amount */}
            <div className="space-y-2">
              <Label>Refund Amount</Label>

              <MoneyInput
                placeholder="e.g. 1000"
                {...form.register("amount")}
              />

              {errors.amount && touchedFields.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Available to refund: ₹{refundableAmount.toLocaleString()}
              </p>

              {isOverRefunding && (
                <p className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                  Refund exceeds current paid amount. Continue only if
                  intentional.
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Refund Date</Label>

              <input
                type="date"
                {...form.register("refundedAt")}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Method */}
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

            {/* Reason */}
            <div className="space-y-2">
              <Label>Refund Reason</Label>

              <select
                {...form.register("refundReason")}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select refund reason</option>

                {refundReasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.refundReason && (
                <p className="text-xs text-destructive">
                  {errors.refundReason.message}
                </p>
              )}

              {refundReasonValue && (
                <p className="text-xs text-muted-foreground">
                  Reason will be stored in finance records.
                </p>
              )}
            </div>

            <Separator />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="destructive"
                className="cursor-pointer"
                disabled={loading || !isDirty || !isValid}
              >
                Review Refund
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
