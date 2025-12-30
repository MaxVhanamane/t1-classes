"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import { renameChapter } from "../../actions/chapter/rename-chapter";

interface Props {
  chapterId: string;
  courseId: string;
  currentTitle: string;
}

export function RenameChapterDialog({
  chapterId,
  courseId,
  currentTitle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);

  async function handleRename() {
    if (!title.trim()) {
      toast.error("Chapter title cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await renameChapter(chapterId, courseId, title.trim());
      toast.success("Chapter renamed");
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to rename chapter"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        type="button"
        className=" justify-start cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Rename chapter
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chapter</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Chapter title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
