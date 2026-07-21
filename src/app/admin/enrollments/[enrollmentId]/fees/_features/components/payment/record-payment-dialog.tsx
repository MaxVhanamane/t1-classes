"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  recordPaymentFormSchema,
  recordPaymentSubmitSchema,
  RecordPaymentFormInput,
} from "../../zod/payment.schema";

import { MoneyInput } from "../money-input";
import { createPayment } from "../../actions/payments/create-payment";
import { toast } from "sonner";
import { PaymentMethodSelect } from "./payment-method-select";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  enrollmentId: string;
  pendingAmount: number;
}

export function RecordPaymentDialog({ enrollmentId, pendingAmount }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<RecordPaymentFormInput>({
    resolver: zodResolver(recordPaymentFormSchema),
    mode: "onChange",
    defaultValues: {
      amount: "",
      paymentMethod: "cash",
      paidAt: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  /**
   * Reset + prefill form every time modal opens
   * - amount defaults to pendingAmount
   * - ensures no stale state
   */
  useEffect(() => {
    if (open) {
      form.reset({
        amount: String(Math.max(pendingAmount, 0)),
        paymentMethod: "cash",
        paidAt: new Date().toISOString().slice(0, 10),
        notes: "",
      });
    }
  }, [open, pendingAmount, form]);

  const amountValue = Number(form.watch("amount") || 0);
  const isOverpaying = amountValue > pendingAmount;

  const { isValid } = form.formState;

  async function onSubmit(data: RecordPaymentFormInput) {
    setLoading(true);

    try {
      const parsed = recordPaymentSubmitSchema.parse({
        amount: Number(data.amount),

        paymentMethod: data.paymentMethod,

        paidAt: data.paidAt,

        notes: data.notes,
      });

      const { error } = await callServerAction(
        createPayment(enrollmentId, parsed),
      );

      if (error) {
        toast.error(error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["enrollment-fees", enrollmentId],
      });

      setOpen(false);

      toast.success("Payment recorded successfully.");
    } catch {
      toast.error("Failed to record payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="cursor-pointer"
        onClick={() => setOpen(true)}
        disabled={pendingAmount <= 0}
      >
        Record Payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onFocusOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment received for this enrollment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <MoneyInput
                placeholder="e.g. 5000"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Pending amount: ₹{pendingAmount.toLocaleString()}
              </p>

              {/* Overpayment warning (non-blocking) */}
              {isOverpaying && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Amount exceeds pending balance. Overpayment will be
                    recorded.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <PaymentMethodSelect
                control={form.control}
                name="paymentMethod"
                label="Payment Method"
              />
            </div>

            {/* Paid At */}
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <input
                type="date"
                {...form.register("paidAt")}
                className="w-full rounded-md border px-3 py-2"
              />
              {form.formState.errors.paidAt && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.paidAt.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes"
                {...form.register("notes")}
              />
            </div>

            <Separator />

            <DialogFooter>
              <Button
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
                disabled={loading || !isValid}
              >
                {loading ? "Saving..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
