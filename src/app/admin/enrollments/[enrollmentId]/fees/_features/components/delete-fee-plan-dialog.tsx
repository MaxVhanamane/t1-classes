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
import { toast } from "sonner";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { deleteFeePlan } from "../actions/fee/delete-fee-plan";

interface DeleteFeePlanDialogProps {
  feePlanId: string;
}

export function DeleteFeePlanDialog({ feePlanId }: DeleteFeePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);

    try {
      const { error } = await callServerAction(deleteFeePlan(feePlanId));

      if (error) {
        toast.error(error);
        return;
      }

      setOpen(false);
      toast.success("Fee plan deleted.");
    } catch {
      toast.error("Failed to delete fee plan.");
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
        Delete Fee Plan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fee Plan</DialogTitle>

            <DialogDescription>
              This will permanently delete the current fee plan.
              <br />
              <br />
              <strong>
                This is only allowed when no successful payments have been been
                recorded.
              </strong>
              <br />
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Keep Fee Plan
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
