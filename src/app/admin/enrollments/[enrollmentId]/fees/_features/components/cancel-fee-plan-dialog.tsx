"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { cancelFeePlan } from "../actions/cancel-fee-plan";
import { ZodError } from "zod";
import { toast } from "sonner";

interface CancelFeePlanDialogProps {
  feePlanId: string;
}

export function CancelFeePlanDialog({ feePlanId }: CancelFeePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await cancelFeePlan(feePlanId);
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
        type="button"
        variant="outline"
        className="text-destructive hover:text-destructive cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Cancel Fee Plan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Fee Plan</DialogTitle>
            <DialogDescription>
              This will cancel the current fee plan and mark it as inactive.
              <br />
              <br />
              <strong>
                No payments have been recorded for this enrollment.
              </strong>
              <br />
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Keep Fee Plan
            </Button>

            <Button
              className="cursor-pointer"
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
