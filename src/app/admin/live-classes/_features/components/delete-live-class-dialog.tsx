"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

import { LiveClassRow } from "../types/live-class.types";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { deleteLiveClass } from "../actions/delete-live-class";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liveClass: LiveClassRow | null;
}

export function DeleteLiveClassDialog({
  open,
  onOpenChange,
  liveClass,
}: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!liveClass) {
        return {
          data: null,
          error: "Live class not found",
        };
      }

      return callServerAction(deleteLiveClass(liveClass.id));
    },
  });

  async function handleDelete() {
    const toastId = toast.loading("Deleting live class...");

    try {
      const { error } = await mutation.mutateAsync();

      if (error) {
        toast.error(error, {
          id: toastId,
        });

        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["live-classes"],
      });

      toast.success("Live class deleted", {
        id: toastId,
      });

      onOpenChange(false);
    } catch {
      toast.error("Delete failed", {
        id: toastId,
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Live Class</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {liveClass?.title ?? "this live class"}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
