"use client";

import { useState } from "react";

import { useMentorshipSessions } from "../hooks/use-mentorship-sessions";

import { MentorshipTableSkeleton } from "./mentorship-table-skeleton";

import { getMentorshipSessionState } from "../helper-functions/get-mentorship-session-state";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { Button } from "@/src/components/ui/button";

import { MentorshipSession } from "../types/mentorship.types";

import { MentorshipSessionDialog } from "./mentorship-session-dialog";

import { useQueryClient } from "@tanstack/react-query";

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
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";

import { deleteMentorshipSession } from "../actions/delete-mentorship-session";

import { callServerAction } from "@/src/lib/actions/call-server-action";

import { mentorshipQueryKeys } from "../constants/query-keys";

import { cn } from "@/src/lib/utils";

import { startMentorshipSession } from "../actions/start-mentorship-session";

import { useRouter } from "next/navigation";

import { Pencil, Play, Trash2, ArrowRight, Radio } from "lucide-react";

const LIMIT = 10;

export function MentorshipSessionsTable() {
  const [page, setPage] = useState(1);

  const router = useRouter();

  const [selectedSession, setSelectedSession] = useState<
    MentorshipSession | undefined
  >();

  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [search] = useState("");

  // prevents spam clicking across all actions
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useMentorshipSessions({
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

  if (isLoading) {
    return <MentorshipTableSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card p-8">
        <p className="text-sm text-destructive">
          Failed to load mentorship sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      {data.data.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No mentorship sessions found.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[260px]">Session Title</TableHead>

                  <TableHead>Audience</TableHead>

                  <TableHead>Duration</TableHead>

                  <TableHead className="min-w-[180px]">Start Time</TableHead>

                  <TableHead className="min-w-[180px]">End Time</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="min-w-[180px]">
                    Session Controls
                  </TableHead>

                  <TableHead className="min-w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.data.map((session) => {
                  const status = getMentorshipSessionState({
                    starts_at: session.starts_at,
                    ends_at: session.ends_at,
                    meeting_id: session.meeting_id,
                  });

                  const startActionKey = `start-${session.id}`;

                  const deleteActionKey = `delete-${session.id}`;

                  const isStarting = isPending(startActionKey);

                  const isDeleting = isPending(deleteActionKey);

                  return (
                    <TableRow
                      key={session.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="max-w-[260px]">
                        <div className="space-y-1">
                          <p
                            title={session.title}
                            className="truncate font-medium text-foreground"
                          >
                            {truncateText(session.title)}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="capitalize">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {session.audience_type}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-medium">
                          {session.duration_minutes}m
                        </span>
                      </TableCell>

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

                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p>
                            {new Date(session.ends_at).toLocaleDateString()}
                          </p>

                          <p className="text-muted-foreground">
                            {new Date(session.ends_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div
                          className={cn(
                            "inline-flex min-w-[125px] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all",

                            status === "scheduled" &&
                              "border-border/60 bg-muted/50 text-muted-foreground",

                            status === "ready" &&
                              "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300",

                            status === "live" &&
                              "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",

                            status === "completed" &&
                              "border-destructive/20 bg-destructive/10 text-destructive",
                          )}
                        >
                          {status === "live" && (
                            <Radio className="size-3 animate-pulse fill-current" />
                          )}

                          {status === "ready" ? "Ready to Start" : status}
                        </div>
                      </TableCell>

                      <TableCell>
                        {status === "ready" && (
                          <Button
                            size="sm"
                            disabled={isStarting}
                            onClick={async () => {
                              if (isStarting) {
                                return;
                              }

                              startAction(startActionKey);

                              const toastId = toast.loading(
                                "Starting session...",
                              );

                              try {
                                const { error } = await callServerAction(
                                  startMentorshipSession(session.id),
                                );

                                if (error) {
                                  toast.error(error, {
                                    id: toastId,
                                  });

                                  return;
                                }

                                toast.success("Session started", {
                                  id: toastId,
                                });

                                router.push(
                                  `/admin/mentorship/setup/${session.id}`,
                                );
                              } catch {
                                toast.error("Failed to start session", {
                                  id: toastId,
                                });
                              } finally {
                                finishAction(startActionKey);
                              }
                            }}
                            className={cn(
                              "h-9 rounded-xl border-0 px-4 font-medium shadow-sm transition-all",

                              isStarting
                                ? "bg-emerald-500/80 text-white"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md",
                            )}
                          >
                            <Play className="mr-2 size-4 fill-current" />
                            Start Session
                          </Button>
                        )}

                        {status === "live" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              router.push(
                                `/admin/mentorship/setup/${session.id}`,
                              );
                            }}
                            className="h-9 rounded-xl border-0 bg-sky-600 px-4 font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md"
                          >
                            <ArrowRight className="mr-2 size-4" />
                            Join Live
                          </Button>
                        )}

                        {status === "completed" && (
                          <span className="text-sm text-muted-foreground">
                            Session ended
                          </span>
                        )}

                        {status === "scheduled" && (
                          <span className="text-sm text-muted-foreground">
                            Not started yet
                          </span>
                        )}
                      </TableCell>

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
                                  Delete mentorship session?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  This action cannot be undone. The mentorship
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
                                      "Deleting mentorship session...",
                                    );

                                    try {
                                      const { error } = await callServerAction(
                                        deleteMentorshipSession(session.id),
                                      );

                                      if (error) {
                                        toast.error(error, {
                                          id: toastId,
                                        });

                                        return;
                                      }

                                      toast.success(
                                        "Mentorship session deleted",
                                        {
                                          id: toastId,
                                        },
                                      );

                                      await queryClient.invalidateQueries({
                                        queryKey: mentorshipQueryKeys.lists(),
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

      <MentorshipSessionDialog
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
