"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { deleteVideo } from "../../actions/topic/video/delete-video";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface DeleteVideoDialogProps {
  courseId: string;
  topicId: string;
  videoId: string;
  videoTitle: string;
}

export function DeleteVideoDialog({
  courseId,
  topicId,
  videoId,
  videoTitle,
}: DeleteVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const { error } = await callServerAction(
        deleteVideo(courseId, videoId, topicId),
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Video deleted");
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start cursor-pointer text-destructive w-full "
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (isPending) return;
          setOpen(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete video</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">“{videoTitle}”</span>?
            This action cannot be undone.
          </p>

          <DialogFooter className="gap-2">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
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
