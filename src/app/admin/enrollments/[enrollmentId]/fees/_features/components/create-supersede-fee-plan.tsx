"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";

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

import { supersedeFeePlan } from "../actions/fee/super-sede-fee-plan";
import { MoneyInput } from "./money-input";
import { toast } from "sonner";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  enrollmentId: string;
  oldFeePlanId: string;

  currentSalePrice: number;
  currentDiscountAmount: number;
  currentDiscountReason?: string | null;
}

export function SupersedeFeePlanDialog({
  enrollmentId,
  oldFeePlanId,
  currentSalePrice,
  currentDiscountAmount,
  currentDiscountReason,
}: Props) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const form = useForm<FeePlanFormInput>({
    resolver: zodResolver(feePlanFormSchema),
    mode: "onChange",
    defaultValues: {
      discountAmount: "",
      discountReason: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        discountAmount: String(currentDiscountAmount),
        discountReason: currentDiscountReason ?? "",
      });
    }
  }, [open, form, currentDiscountAmount, currentDiscountReason]);

  const discount = Number(form.watch("discountAmount") || 0);

  const finalAmount = useMemo(
    () => Math.max(currentSalePrice - discount, 0),
    [currentSalePrice, discount],
  );

  const { isDirty, isValid } = form.formState;

  async function onSubmit(data: FeePlanFormInput) {
    setLoading(true);

    try {
      const parsed = feePlanSubmitSchema.parse({
        discountAmount: Number(data.discountAmount || 0),

        discountReason: data.discountReason?.trim().toLowerCase() || undefined,
      });

      const { error } = await callServerAction(
        supersedeFeePlan(oldFeePlanId, enrollmentId, parsed),
      );

      if (error) {
        toast.error(error);

        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["enrollment-fees", enrollmentId],
      });

      setOpen(false);

      toast.success("Revised fee plan created.");
    } catch (err) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0]?.message ?? "Invalid form input");

        return;
      }

      toast.error("Failed to update fee plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Create Revised Fee Plan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Revised Fee Plan</DialogTitle>

            <DialogDescription>
              Current plan will be marked as <strong>superseded</strong>.
              Payment history remains unchanged.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Sale Price */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sale Price</p>

                  <p className="text-xs text-muted-foreground">
                    Locked from previous plan
                  </p>
                </div>

                <p className="text-lg font-semibold">
                  ₹{currentSalePrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label>Extra Discount</Label>

              <MoneyInput
                placeholder="e.g. 500"
                {...form.register("discountAmount")}
              />

              {form.formState.errors.discountAmount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.discountAmount.message}
                </p>
              )}
            </div>

            {/* Final */}
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Final Payable
                </span>

                <span className="text-2xl font-semibold">
                  ₹{finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Reason */}
            <div className="space-y-2">
              <Label>Discount Reason</Label>

              <Textarea
                rows={3}
                placeholder="e.g. scholarship, financial_need, sibling_discount"
                {...form.register("discountReason")}
              />

              <p className="text-xs text-muted-foreground">
                Required when discount is greater than zero.
              </p>

              {form.formState.errors.discountReason && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.discountReason.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
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
                className="cursor-pointer"
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
