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
} from "@/src/components/ui/alert-dialog";

import { Card, CardContent } from "@/src/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/src/components/ui/tooltip";

import {
  AlertCircle,
  Bell,
  BellOff,
  BookOpen,
  FileText,
  Loader2,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { format } from "date-fns";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { DeleteButton } from "@/src/components/ui/common/delete-button";

type Props = {
  notifications: NotificationRow[];
  loading: boolean;
};

export function NotificationsTable({ notifications, loading }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  if (loading) {
    return <TableSkeleton rows={4} columns={5} showTableHeader />;
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

      const { error } = await callServerAction(deleteNotification(deleteId));

      if (error) {
        toast.error(error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["admin", "notifications"],
      });

      toast.success("Notification deleted");

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
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>

                <TableHead>Type</TableHead>

                <TableHead>Audience</TableHead>

                <TableHead>Created</TableHead>

                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {notifications.map((n) => {
                const typeConfig = {
                  announcement: {
                    icon: <Megaphone className="size-4 text-blue-500" />,
                    label: "Announcement",
                  },

                  reminder: {
                    icon: <Bell className="size-4 text-amber-500" />,
                    label: "Reminder",
                  },

                  test: {
                    icon: <FileText className="size-4 text-violet-500" />,
                    label: "Test",
                  },

                  system: {
                    icon: <Settings className="size-4 text-slate-500" />,
                    label: "System",
                  },

                  batch: {
                    icon: <Users className="size-4 text-green-500" />,
                    label: "Batch",
                  },

                  course: {
                    icon: <BookOpen className="size-4 text-emerald-500" />,
                    label: "Course",
                  },
                }[n.type] ?? {
                  icon: <AlertCircle className="size-4 text-red-500" />,
                  label: n.type,
                };

                return (
                  <TableRow
                    key={n.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    {/* Notification */}
                    <TableCell className="py-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-[320px] cursor-pointer">
                            <p className="truncate font-medium">
                              {n.title ?? "Untitled"}
                            </p>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {n.message}
                            </p>
                          </div>
                        </TooltipTrigger>

                        <TooltipContent
                          align="start"
                          side="top"
                          className="max-w-md rounded-xl border bg-popover p-4 shadow-xl"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold text-popover-foreground">
                              {n.title ?? "Untitled notification"}
                            </p>

                            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                              {n.message}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {typeConfig.icon}

                        <span className="text-sm font-medium">
                          {typeConfig.label}
                        </span>
                      </div>
                    </TableCell>

                    {/* Audience */}
                    <TableCell className="py-4">
                      {n.batch_id ? (
                        <Badge variant="secondary" className="font-medium">
                          {n.batches?.title}
                        </Badge>
                      ) : (
                        <Badge
                          className="border-blue-500/20 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300"
                          variant="outline"
                        >
                          All batches
                        </Badge>
                      )}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="py-4">
                      <div>
                        <div className="text-sm font-medium">
                          {format(new Date(n.created_at), "dd MMM yyyy")}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {format(new Date(n.created_at), "hh:mm a")}
                        </div>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4">
                      <div className="flex justify-start gap-1.5">
                        <NotificationDialog notification={n} />

                        <DeleteButton onClick={() => setDeleteId(n.id)}>
                          Delete
                        </DeleteButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => {
          if (!isDeleting) {
            setDeleteId(null);
          }
        }}
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
