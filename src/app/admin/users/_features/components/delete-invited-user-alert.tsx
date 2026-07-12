"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, UserX } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";

import { callServerAction } from "@/src/lib/actions/call-server-action";
import { deleteInvitedUser } from "../actions/delete-invited-user";
import { UserTableItem } from "../types/user-table";

export function DeleteInvitedUserAlert({ user }: { user: UserTableItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleting(true);

    const toastId = toast.loading("Deleting user account...");

    try {
      const result = await callServerAction(deleteInvitedUser(user.id));

      if (result.error) {
        toast.error(result.error, { id: toastId });
        setIsDeleting(false);
        return;
      }

      toast.success("User permanently deleted.", { id: toastId });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsOpen(false);
    } catch {
      toast.error("Failed to delete user.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" title="Delete User">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <UserX className="size-5" />
            Permanently Delete User?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <p>
                You are about to completely delete the account for{" "}
                <strong className="text-foreground">{user.email}</strong>.
              </p>
              <p>
                This will permanently erase their profile from the database and
                instantly revoke their pending setup link. They will not be able
                to activate this account.
              </p>
              <p className="font-medium text-destructive">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting User...
              </>
            ) : (
              "Yes, delete user"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
