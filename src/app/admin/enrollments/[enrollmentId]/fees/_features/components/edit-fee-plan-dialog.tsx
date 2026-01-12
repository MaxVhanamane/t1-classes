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

import { updateFeePlan } from "../actions/fee-actions";
import {
  FeePlanFormInput,
  feePlanFormSchema,
  feePlanSubmitSchema,
} from "../zod/feePlan.schema";
import { MoneyInput } from "./money-input";
import { toast } from "sonner";
import { ZodError } from "zod";

interface Props {
  feePlan: {
    id: string;
    total_amount: number;
    discount_amount: number;
    effective_from: string;
    notes?: string | null;
  };
}

export function EditFeePlanDialog({ feePlan }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FeePlanFormInput>({
    resolver: zodResolver(feePlanFormSchema),
    mode: "onChange",
    defaultValues: {
      totalAmount: "",
      discountAmount: "",
      effectiveFrom: "",
      notes: "",
    },
  });

  //  Always reset on open
  useEffect(() => {
    if (open) {
      form.reset({
        totalAmount: String(feePlan.total_amount),
        discountAmount: String(feePlan.discount_amount),
        effectiveFrom: feePlan.effective_from,
        notes: feePlan.notes ?? "",
      });
    }
  }, [open, feePlan, form]);

  const total = Number(form.watch("totalAmount") || 0);
  const discount = Number(form.watch("discountAmount") || 0);
  const finalAmount = Math.max(total - discount, 0);

  const { isDirty, isValid } = form.formState;

  //  Revalidate discount whenever total changes
  useEffect(() => {
    void form.trigger("discountAmount");
  }, [total, form]);

  async function onSubmit(data: FeePlanFormInput) {
    setLoading(true);
    try {
      const parsed = feePlanSubmitSchema.parse({
        totalAmount: Number(data.totalAmount),
        discountAmount: Number(data.discountAmount || 0),
        effectiveFrom: data.effectiveFrom,
        notes: data.notes,
      });
      await updateFeePlan(feePlan.id, parsed);
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
        size="sm"
        variant="default"
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee Plan</DialogTitle>
            <DialogDescription>
              Editing is allowed only before payments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Final Amount
                </span>
                <span className="text-xl font-semibold">
                  ₹ {finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

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

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea {...form.register("notes")} />
            </div>

            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={loading || !isDirty || !isValid}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
