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
  feePlanFormSchema,
  feePlanSubmitSchema,
  FeePlanFormInput,
} from "../zod/feePlan.schema";

import { supersedeFeePlan } from "../actions/fee-actions";
import { MoneyInput } from "./money-input";
import { ZodError } from "zod";
import { toast } from "sonner";

interface Props {
  enrollmentId: string;
  oldFeePlanId: string;
  currentTotalAmount: number;
  currentDiscountAmount: number;
  currentNotes?: string | null;
}

export function SupersedeFeePlanDialog({
  enrollmentId,
  oldFeePlanId,
  currentTotalAmount,
  currentDiscountAmount,
  currentNotes,
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

  /** Reset form when dialog opens */
  useEffect(() => {
    if (open) {
      form.reset({
        totalAmount: String(currentTotalAmount),
        discountAmount: String(currentDiscountAmount),
        effectiveFrom: new Date().toISOString().slice(0, 10),
        notes: currentNotes ?? "",
      });
    }
  }, [open, form, currentTotalAmount, currentDiscountAmount, currentNotes]);

  const total = Number(form.watch("totalAmount") || 0);
  const discount = Number(form.watch("discountAmount") || 0);
  const finalAmount = Math.max(total - discount, 0);

  /**  Revalidate discount when total changes */
  useEffect(() => {
    //I know this returns a promise, and I am intentionally not awaiting it
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
      await supersedeFeePlan(oldFeePlanId, enrollmentId, parsed);
      setOpen(false);
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        toast(issue?.message ?? "Invalid form input");
        return;
      }

      toast("Failed to update fee plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="cursor-pointer"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Create Revised Fee Plan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Revised Fee Plan</DialogTitle>
            <DialogDescription>
              You are creating a revised fee plan.
              <br />
              The current plan will be marked as
              <strong> superseded</strong>. Payment history will be preserved.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <MoneyInput {...form.register("totalAmount")} />
                {form.formState.errors.totalAmount && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.totalAmount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Discount</Label>
                <MoneyInput {...form.register("discountAmount")} />
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
                placeholder="Reason for revision, approvals, etc."
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
                {loading ? "Saving..." : "Create Revised Fee Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
