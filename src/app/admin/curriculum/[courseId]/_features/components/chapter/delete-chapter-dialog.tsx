"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { deleteChapter } from "../../actions/chapter/delete-chapter";

interface Props {
  chapterId: string;
  courseId: string;
}

export function DeleteChapterDialog({ chapterId, courseId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteChapter(chapterId, courseId);
      toast.success("Chapter deleted");
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete chapter"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        className="justify-start cursor-pointer text-destructive"
        onClick={() => setOpen(true)}
      >
        Delete chapter
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chapter?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This will permanently delete the chapter.
            <br />
            You must delete all topics inside it first.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
