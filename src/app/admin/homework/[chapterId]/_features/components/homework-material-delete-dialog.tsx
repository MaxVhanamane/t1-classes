"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { HomeworkMaterial } from "../types/homework";
import { homeworkQueryKeys } from "../constants/query-keys";
import { callServerAction } from "@/src/lib/actions/call-server-action";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { deleteHomeworkMaterial } from "../actions/delete-homework-material";

type HomeworkMaterialDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: HomeworkMaterial;
};

export function HomeworkMaterialDeleteDialog({
  open,
  onOpenChange,
  material,
}: HomeworkMaterialDeleteDialogProps) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!material) return;

    const toastId = toast.loading("Deleting homework material...");

    try {
      setDeleting(true);

      const { error } = await callServerAction(
        deleteHomeworkMaterial(material.id),
      );

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: homeworkQueryKeys.lists(),
      });

      toast.success("Homework material deleted", { id: toastId });
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete homework material", { id: toastId });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Homework Material</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-foreground">
              {material?.title}
            </span>
            .
            <br />
            <br />
            The PDF file will also be removed from storage and cannot be
            recovered. Any active assignments pointing to this file will be
            broken.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Material"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
