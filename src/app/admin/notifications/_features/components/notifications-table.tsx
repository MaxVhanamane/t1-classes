"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { NotificationRow } from "../hooks/use-notifications";
import { NotificationDialog } from "./notification-dialog";
import { deleteNotification } from "../actions/delete-notification";

import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/src/components/ui/alert-dialog";

import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/src/components/ui/tooltip";

import { BellOff } from "lucide-react";

type Props = {
  notifications: NotificationRow[];
  loading: boolean;
};

export function NotificationsTable({ notifications, loading }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  if (loading) {
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <BellOff className="h-8 w-8 text-muted-foreground" />

          <div className="space-y-1">
            <p className="text-sm font-medium">No notifications found</p>
            <p className="text-sm text-muted-foreground">
              No notifications were created in the last 7 days.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      setIsDeleting(true);

      await deleteNotification(deleteId);

      toast.success("Notification deleted");

      await queryClient.invalidateQueries({
        queryKey: ["admin-notifications"],
      });

      setDeleteId(null);
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-90">Notification</TableHead>
                <TableHead className="w-30">Type</TableHead>
                <TableHead className="w-40">Batch</TableHead>
                <TableHead className="w-50">Created</TableHead>
                <TableHead className="w-35 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  {/* Notification cell */}
                  <TableCell className="w-90">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col cursor-pointer max-w-90">
                          <span className="truncate font-medium">
                            {n.title ?? "No title"}
                          </span>

                          <span className="text-xs text-muted-foreground truncate">
                            {n.message}
                          </span>
                        </div>
                      </TooltipTrigger>

                      <TooltipContent align="start" className="max-w-md">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {n.title ?? "No title"}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {n.message}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="capitalize">{n.type}</TableCell>

                  {/* Batch */}
                  <TableCell>{n.batch_id ? n.batches?.title : "All"}</TableCell>

                  {/* Created */}
                  <TableCell>
                    {new Date(n.created_at).toLocaleString()}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right space-x-2">
                    <NotificationDialog notification={n}></NotificationDialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(n.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      {/* Delete confirmation dialog */}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              notification.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
