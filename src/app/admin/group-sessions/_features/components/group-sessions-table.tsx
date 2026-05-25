"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { Pencil, Trash2, Clock3, Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { Button } from "@/src/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";

import { cn } from "@/src/lib/utils";

import { callServerAction } from "@/src/lib/actions/call-server-action";

import { GroupSessionDialog } from "./group-session-dialog";

import { GroupSessionsTableSkeleton } from "./group-sessions-table-skeleton";

import { useGroupSessions } from "../hooks/use-group-sessions";

import { deleteGroupSession } from "../actions/delete-group-session";

import { groupSessionsQueryKeys } from "../constants/query-keys";

import { GroupSession } from "../types/group-session.types";

const LIMIT = 10;

export function GroupSessionsTable() {
  const [page, setPage] = useState(1);

  const [search] = useState("");

  const [selectedSession, setSelectedSession] = useState<
    GroupSession | undefined
  >();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useGroupSessions({
    page,
    limit: LIMIT,
    search,
  });

  function startAction(key: string) {
    setPendingActions((prev) => {
      const next = new Set(prev);

      next.add(key);

      return next;
    });
  }

  function finishAction(key: string) {
    setPendingActions((prev) => {
      const next = new Set(prev);

      next.delete(key);

      return next;
    });
  }

  function isPending(key: string) {
    return pendingActions.has(key);
  }

  function truncateText(text: string, max = 42) {
    if (text.length <= max) {
      return text;
    }

    return `${text.slice(0, max)}...`;
  }

  function getSessionState(session: GroupSession) {
    const now = new Date();

    const startsAt = new Date(session.starts_at);

    const estimatedEnd = session.expected_duration_minutes
      ? new Date(
          startsAt.getTime() + session.expected_duration_minutes * 60 * 1000,
        )
      : null;

    const hasMeetingLink = Boolean(session.meeting_id);

    if (!hasMeetingLink) {
      return "waiting_for_link";
    }

    if (now < startsAt) {
      return "scheduled";
    }

    if (estimatedEnd && now > estimatedEnd) {
      return "ended";
    }

    return "live";
  }

  if (isLoading) {
    return <GroupSessionsTableSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8">
        <p className="text-sm text-destructive">
          Failed to load group sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {data.data.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No group sessions found.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[260px]">Session</TableHead>

                  <TableHead>Audience</TableHead>

                  <TableHead>Duration</TableHead>

                  <TableHead className="min-w-[180px]">Start Time</TableHead>

                  <TableHead>Meeting</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.data.map((session) => {
                  const status = getSessionState(session);

                  const deleteActionKey = `delete-${session.id}`;

                  const isDeleting = isPending(deleteActionKey);

                  return (
                    <TableRow
                      key={session.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* ---------- Session ---------- */}

                      <TableCell className="max-w-[260px]">
                        <div className="space-y-1">
                          <p
                            title={session.title}
                            className="truncate font-medium text-foreground"
                          >
                            {truncateText(session.title)}
                          </p>

                          {session.description && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {truncateText(session.description, 55)}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* ---------- Audience ---------- */}

                      <TableCell className="capitalize">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          <Users className="size-3" />

                          {session.audience_type === "selected_students"
                            ? "Selected"
                            : "Batch"}
                        </span>
                      </TableCell>

                      {/* ---------- Duration ---------- */}

                      <TableCell>
                        {session.expected_duration_minutes ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium">
                            <Clock3 className="size-4 text-muted-foreground" />
                            {session.expected_duration_minutes}m
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* ---------- Start Time ---------- */}

                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p>
                            {new Date(session.starts_at).toLocaleDateString()}
                          </p>

                          <p className="text-muted-foreground">
                            {new Date(session.starts_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </TableCell>

                      {/* ---------- Meeting ---------- */}

                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",

                            session.meeting_id
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {session.meeting_id ? "Link Added" : "No Link"}
                        </span>
                      </TableCell>

                      {/* ---------- Status ---------- */}

                      <TableCell>
                        <div
                          className={cn(
                            "inline-flex min-w-[120px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm",

                            status === "waiting_for_link" &&
                              "border-border/60 bg-muted/50 text-muted-foreground",

                            status === "scheduled" &&
                              "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300",

                            status === "live" &&
                              "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",

                            status === "ended" &&
                              "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
                          )}
                        >
                          {status === "waiting_for_link" && "Waiting"}

                          {status === "scheduled" && "Scheduled"}

                          {status === "live" && "Live"}

                          {status === "ended" && "Ended"}
                        </div>
                      </TableCell>

                      {/* ---------- Actions ---------- */}

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSession(session);

                              setIsEditDialogOpen(true);
                            }}
                            className="h-9 rounded-xl border-border/60 bg-background px-3 transition-all hover:bg-muted"
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting}
                                className="h-9 rounded-xl bg-destructive px-3 shadow-sm transition-all hover:bg-destructive/90 hover:shadow-md"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="border-border/60 bg-background">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete group session?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  This action cannot be undone. The group
                                  session and all selected students will be
                                  removed permanently.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                <AlertDialogAction
                                  disabled={isDeleting}
                                  onClick={async (event) => {
                                    event.preventDefault();

                                    if (isDeleting) {
                                      return;
                                    }

                                    startAction(deleteActionKey);

                                    const toastId = toast.loading(
                                      "Deleting group session...",
                                    );

                                    try {
                                      const { error } = await callServerAction(
                                        deleteGroupSession(session.id),
                                      );

                                      if (error) {
                                        toast.error(error, {
                                          id: toastId,
                                        });

                                        return;
                                      }

                                      toast.success("Group session deleted", {
                                        id: toastId,
                                      });

                                      await queryClient.invalidateQueries({
                                        queryKey:
                                          groupSessionsQueryKeys.lists(),
                                      });
                                    } catch {
                                      toast.error("Something went wrong", {
                                        id: toastId,
                                      });
                                    } finally {
                                      finishAction(deleteActionKey);
                                    }
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Session
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* ---------- Pagination ---------- */}

          <div className="flex flex-col gap-4 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-xl"
            >
              Previous
            </Button>

            <p className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {data.totalPages}
              </span>
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= data.totalPages}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </>
      )}

      <GroupSessionDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setSelectedSession(undefined);
          }
        }}
        session={selectedSession}
      />
    </div>
  );
}
