"use client";

import { useEffect, useMemo, useState } from "react";
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

import { MoneyInput } from "./money-input";
import { TruncatedWithTooltip } from "@/src/components/ui/TruncatedWithTooltip";
import { createFeePlan } from "../actions/fee/create-fee-plan";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { toast } from "sonner";

interface Props {
  enrollmentId: string;
  title: string;
  listPrice: number;
  salePrice: number;
}

export function CreateFeePlanDialog({
  enrollmentId,
  title,
  listPrice,
  salePrice,
}: Props) {
  const [open, setOpen] = useState(false);

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
        discountAmount: "",
        discountReason: "",
      });
    }
  }, [open, form]);

  const discount = Number(form.watch("discountAmount") || 0);

  const finalAmount = useMemo(
    () => Math.max(salePrice - discount, 0),
    [salePrice, discount],
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
        createFeePlan(enrollmentId, parsed),
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Fee plan created.");

      setOpen(false);
    } catch {
      toast.error("Failed to create fee plan.");
    } finally {
      setLoading(false);
    }
  }

  const standardDiscount = listPrice - salePrice;

  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        Create Fee Plan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Fee Plan</DialogTitle>

            <DialogDescription className="flex items-center gap-1">
              Define fee plan for{" "}
              <TruncatedWithTooltip
                text={title}
                className="inline-block max-w-64 font-medium"
              />
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Pricing Snapshot */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">List Price</span>

                <span className="font-medium line-through text-muted-foreground">
                  ₹{listPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Standard Sale Price
                </span>

                <span className="font-semibold">
                  ₹{salePrice.toLocaleString()}
                </span>
              </div>

              {standardDiscount > 0 && (
                <div className="rounded-md bg-background px-3 py-2 text-xs text-muted-foreground">
                  Includes built-in discount of ₹
                  {standardDiscount.toLocaleString()}
                </div>
              )}
            </div>

            {/* Offered Amount */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Offered Amount</p>

                  <p className="text-xs text-muted-foreground">
                    Fixed to current sale price
                  </p>
                </div>

                <p className="text-lg font-semibold">
                  ₹{salePrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Extra Discount */}
            <div className="space-y-2">
              <Label>Extra Discount</Label>

              <MoneyInput
                placeholder="e.g. 500"
                {...form.register("discountAmount")}
              />

              <p className="text-xs text-muted-foreground">
                Additional concession beyond sale price.
              </p>

              {form.formState.errors.discountAmount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.discountAmount.message}
                </p>
              )}
            </div>

            {/* Final Amount */}
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Final Payable
                </span>

                <span className="text-2xl font-semibold tracking-tight">
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
                placeholder="e.g. scholarship, sibling discount, financial need"
                {...form.register("discountReason")}
              />

              <p className="text-xs text-muted-foreground">
                Required only when extra discount is applied.
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
                {loading ? "Saving..." : "Create Fee Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
