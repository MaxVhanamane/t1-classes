"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  amount: number;
  loading: boolean;
}

export function ConfirmRefundDialog({
  open,
  onCancel,
  onConfirm,
  amount,
  loading,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (!loading) onCancel();
      }}
    >
      <DialogContent className="max-w-[calc(100%-4rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Confirm Refund</DialogTitle>
          <DialogDescription>
            You are about to issue a refund of{" "}
            <span className="font-semibold text-red-600">
              ₹{amount.toLocaleString()}
            </span>
            . This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          ⚠️ Refunds permanently affect financial records. Please confirm only
          if you are sure.
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Processing..." : "Yes, issue refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
