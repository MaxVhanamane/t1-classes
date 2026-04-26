"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { deletePdf } from "../../actions/topic/pdf/delete-pdf";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface Props {
  courseId: string;
  topicId: string;
  pdfId: string;
  pdfTitle: string;
}

export function DeletePdfDialog({ courseId, topicId, pdfId, pdfTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  function handleDelete() {
    startTransition(async () => {
      const { error } = await callServerAction(
        deletePdf(courseId, topicId, pdfId),
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("PDF deleted");
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-destructive cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Delete PDF
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete PDF</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">“{pdfTitle}”</span>?
            This action cannot be undone.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              className="cursor-pointer"
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
