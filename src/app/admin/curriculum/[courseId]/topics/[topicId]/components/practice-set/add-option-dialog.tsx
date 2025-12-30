"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  onAdd: (data: { option_text: string }) => void;
  canOpen: boolean;
}

export function AddOptionDialog({ onAdd, canOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function handleTriggerClick() {
    if (!canOpen) {
      toast.info("Add the question first", {
        description: "Write the question before adding options.",
      });
      return;
    }
    setOpen(true);
  }

  function handleAdd() {
    const value = text.trim();
    if (!value) return;

    onAdd({ option_text: value });
    setText("");
    setOpen(false);
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) setText("");
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleTriggerClick}
      >
        + Add option
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add option</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Option text</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Force is mass × acceleration"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              type="button"
              onClick={handleAdd}
              disabled={!text.trim()}
            >
              Add option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
