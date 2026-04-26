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
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";

import {
  FeePlanFormInput,
  feePlanFormSchema,
  feePlanSubmitSchema,
} from "../zod/feePlan.schema";

import { MoneyInput } from "./money-input";
import { toast } from "sonner";
import { updateFeePlan } from "../actions/fee/update-fee-plan";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface Props {
  feePlan: {
    id: string;
    offered_amount: number;
    discount_amount: number;
    discount_reason?: string | null;
  };
}

export function EditFeePlanDialog({ feePlan }: Props) {
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
        discountAmount: String(feePlan.discount_amount),
        discountReason: feePlan.discount_reason ?? "",
      });
    }
  }, [open, feePlan, form]);

  const discount = Number(form.watch("discountAmount") || 0);

  const finalAmount = useMemo(
    () => Math.max(feePlan.offered_amount - discount, 0),
    [feePlan.offered_amount, discount],
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
        updateFeePlan(feePlan.id, parsed),
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Fee plan updated.");

      setOpen(false);
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
        className="cursor-pointer"
        size="sm"
        variant="default"
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Fee Plan</DialogTitle>

            <DialogDescription>
              Editing is allowed only before any payments are recorded.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Locked Offered Amount */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Offered Amount</p>

                  <p className="text-xs text-muted-foreground">
                    Fixed for this fee plan
                  </p>
                </div>

                <p className="text-lg font-semibold">
                  ₹{feePlan.offered_amount.toLocaleString()}
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
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Final Amount
                </span>

                <span className="text-xl font-semibold">
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
                disabled={loading || !isDirty || !isValid}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
