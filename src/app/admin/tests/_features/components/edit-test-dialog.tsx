"use client";

import { useState } from "react";

import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";

import { Input } from "@/src/components/ui/input";

import { Textarea } from "@/src/components/ui/textarea";

import { updateTest } from "../actions/update-test";

import type { TestRow } from "../types/test.types";

import { callServerAction } from "@/src/lib/actions/call-server-action";
import { Label } from "@/src/components/ui/label";

interface Props {
  test: TestRow;

  open: boolean;

  onOpenChange: (v: boolean) => void;
}

export function EditTestDialog({ test, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(test.title);

  const [description, setDescription] = useState(test.description ?? "");

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Title cannot be empty");

      return;
    }

    setSaving(true);

    const { error } = await callServerAction(
      updateTest(test.id, {
        title: title.trim(),

        description: description.trim() || null,
      }),
    );

    if (error) {
      toast.error(error);

      setSaving(false);

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["admin", "tests"],
    });

    toast.success("Test updated");

    onOpenChange(false);

    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>

          <DialogDescription>
            You can update the test title and description. Test type cannot be
            changed once created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Title</Label>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter test title"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Description</Label>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional test description"
              rows={4}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Test Type</Label>

            <Input value={test.test_type} disabled />

            <p className="text-xs text-muted-foreground">
              Test type cannot be changed after creation
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
