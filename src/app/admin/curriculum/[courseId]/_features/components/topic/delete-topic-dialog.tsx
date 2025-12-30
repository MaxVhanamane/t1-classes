"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

import { useRouter } from "next/navigation";
import { deleteTopic } from "../../actions/topic/delete-topic";

interface DeleteTopicDialogProps {
  topicId: string;
  courseId: string;
}

export function DeleteTopicDialog({
  topicId,
  courseId,
}: DeleteTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTopic(courseId, topicId);
        toast.success("Topic deleted");
        router.replace(`/admin/curriculum/${courseId}`);
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete topic"
        );
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        className="justify-start w-full text-destructive cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Delete topic
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete topic</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This will permanently delete this topic and all its content. This
            action cannot be undone.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
