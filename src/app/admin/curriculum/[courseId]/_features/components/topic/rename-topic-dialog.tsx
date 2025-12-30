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
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import { renameTopic } from "../../actions/topic/rename-topic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface RenameTopicDialogProps {
  topicId: string;
  courseId: string;
  currentTitle: string;
}

export function RenameTopicDialog({
  topicId,
  courseId,
  currentTitle,
}: RenameTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    // Reset title ONLY when opening
    if (nextOpen) {
      setTitle(currentTitle);
    }
  }

  function handleSubmit() {
    const trimmed = title.trim();

    if (!trimmed || trimmed === currentTitle) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        await renameTopic(courseId, topicId, {
          title: trimmed,
        });

        toast.success("Topic renamed");
        setOpen(false);

        /**
         *  Sync URL title if we are currently on this topic page
         */
        if (pathname.includes(`/topics/${topicId}`)) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("title", trimmed);

          router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
          });
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to rename chapter"
        );
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        className="justify-start w-full cursor-pointer"
        onClick={() => handleOpenChange(true)}
      >
        Rename topic
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename topic</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="topic-title">Topic title</Label>
            <Input
              id="topic-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

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
              onClick={handleSubmit}
              disabled={isPending || !title.trim()}
              className="cursor-pointer"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
