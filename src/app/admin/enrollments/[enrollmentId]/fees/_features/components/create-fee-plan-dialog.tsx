"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";

import {
  feePlanFormSchema,
  feePlanSubmitSchema,
  FeePlanFormInput,
} from "../zod/feePlan.schema";
import { createFeePlan } from "../actions/fee-actions";
import { MoneyInput } from "./money-input";
import { TruncatedWithTooltip } from "@/src/components/ui/TruncatedWithTooltip";

interface Props {
  enrollmentId: string;
  defaultTotalAmount: number;
  title: string; // renamed (course OR batch)
}

export function CreateFeePlanDialog({
  enrollmentId,
  defaultTotalAmount,
  title,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FeePlanFormInput>({
    resolver: zodResolver(feePlanFormSchema),
    mode: "onChange",
    defaultValues: {
      totalAmount: "",
      discountAmount: "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  /** Reset form every time modal opens */
  useEffect(() => {
    if (open) {
      form.reset({
        totalAmount: String(defaultTotalAmount),
        discountAmount: "",
        effectiveFrom: new Date().toISOString().slice(0, 10),
        notes: "",
      });
    }
  }, [open, form, defaultTotalAmount]);

  const total = Number(form.watch("totalAmount") || 0);
  const discount = Number(form.watch("discountAmount") || 0);
  const finalAmount = Math.max(total - discount, 0);

  /** Revalidate discount when total changes */
  useEffect(() => {
    //I know this returns a promise, and I am intentionally not awaiting it...eslint rule
    void form.trigger("discountAmount");
  }, [total, form]);

  const { isDirty, isValid } = form.formState;

  async function onSubmit(data: FeePlanFormInput) {
    setLoading(true);
    try {
      const parsed = feePlanSubmitSchema.parse({
        totalAmount: Number(data.totalAmount),
        discountAmount: Number(data.discountAmount || 0),
        effectiveFrom: data.effectiveFrom,
        notes: data.notes,
      });

      await createFeePlan(enrollmentId, parsed);
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create fee plan.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  const basePrice = defaultTotalAmount;
  const isPriceOverridden = total > 0 && total !== basePrice;
  const priceDiff = total - basePrice;

  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        Create Fee Plan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Fee Plan</DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              Define the fee structure for{" "}
              <TruncatedWithTooltip
                text={title}
                className="inline-block max-w-64 font-medium"
              />
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <MoneyInput
                  placeholder="e.g. 25000"
                  {...form.register("totalAmount")}
                />
                {form.formState.errors.totalAmount && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.totalAmount.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Base price: ₹{basePrice.toLocaleString()}
                </p>

                {isPriceOverridden && (
                  <div className="mt-1 rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1">
                    <div className="text-xs text-yellow-800">
                      ⚠️ Base price has been{" "}
                      <span className="font-medium">
                        {priceDiff > 0 ? "increased" : "decreased"}
                      </span>{" "}
                      by ₹{Math.abs(priceDiff).toLocaleString()} for{" "}
                      <TruncatedWithTooltip
                        text={title}
                        className="inline-block max-w-40 align-bottom font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Discount</Label>
                <MoneyInput
                  placeholder="e.g. 5000"
                  {...form.register("discountAmount")}
                />
                {form.formState.errors.discountAmount && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.discountAmount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Final Amount */}
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Final Payable Amount
                </span>
                <span className="text-xl font-semibold">
                  ₹ {finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Effective Date */}
            <div className="space-y-2">
              <Label>Effective From</Label>
              <input
                type="date"
                {...form.register("effectiveFrom")}
                className="w-full rounded-md border px-3 py-2"
              />
              {form.formState.errors.effectiveFrom && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.effectiveFrom.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes about discounts, approvals, etc."
                {...form.register("notes")}
              />
            </div>

            <DialogFooter className="mt-6">
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
                disabled={loading || !isDirty || !isValid}
              >
                {loading ? "Saving..." : "Create Fee Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
