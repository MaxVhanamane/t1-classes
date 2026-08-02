"use client";

import { useState } from "react";
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Info } from "lucide-react";

import { deleteGroupSession } from "../actions/delete-group-session";

import { groupSessionsQueryKeys } from "../constants/query-keys";

import { GroupSession } from "../types/group-session.types";
import { useQueryClient } from "@tanstack/react-query";

type GroupSessionsTableProps = {
  sessions: GroupSession[];
};

export function GroupSessionsTable({ sessions }: GroupSessionsTableProps) {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<
    GroupSession | undefined
  >();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

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

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card ">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="sticky left-0 z-20 w-16 bg-secondary text-center font-medium">
                No.
              </TableHead>

              <TableHead className="min-w-50">Title</TableHead>

              <TableHead className="min-w-50">Description</TableHead>

              <TableHead className="min-w-50">Batch</TableHead>
              <TableHead className="min-w-50">Created By</TableHead>
              <TableHead>Audience</TableHead>

              <TableHead>Duration</TableHead>

              <TableHead className="min-w-[180px]">Start Time</TableHead>

              <TableHead>Meeting</TableHead>

              <TableHead>Status</TableHead>

              <TableHead className="w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sessions.map((session, index) => {
              const status = getSessionState(session);

              const deleteActionKey = `delete-${session.id}`;

              const isDeleting = isPending(deleteActionKey);

              return (
                <TableRow
                  key={session.id}
                  className="group transition-colors hover:bg-muted-subtle"
                >
                  <TableCell className="sticky left-0 z-20 w-14 min-w-14 bg-card text-center font-semibold transition-colors group-hover:bg-muted-subtle">
                    {index + 1}
                  </TableCell>
                  {/* ---------- Session ---------- */}

                  {/* ---------- Title ---------- */}

                  <TableCell className="max-w-50">
                    <div className="flex items-center gap-2">
                      <p
                        title={session.title}
                        className="truncate font-medium text-foreground"
                      >
                        {truncateText(session.title)}
                      </p>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <Info className="size-3.5" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="max-w-sm wrap-break-word bg-card">
                          {session.title}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>

                  {/* ---------- Description ---------- */}

                  <TableCell className="max-w-50">
                    <div className="flex items-center gap-2">
                      {session.description ? (
                        <>
                          <p
                            title={session.description}
                            className="truncate text-sm text-muted-foreground"
                          >
                            {session.description}
                          </p>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <Info className="size-3.5" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="max-w-sm wrap-break-word bg-card">
                              {session.description}
                            </PopoverContent>
                          </Popover>
                        </>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-dashed border-muted-foreground/30 bg-muted/50 px-2 py-0.5 text-xs font-medium italic text-muted-foreground">
                          No description
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* ---------- Batch ---------- */}

                  <TableCell className="max-w-50">
                    <div className="flex items-center gap-2">
                      <span
                        title={session.batch_title ?? "-"}
                        className="truncate rounded-md border border-sky-200/60 bg-sky-50/80 px-2 py-1 text-xs font-medium text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-300"
                      >
                        {session.batch_title ?? "-"}
                      </span>

                      {session.batch_title && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <Info className="size-3.5" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="max-w-sm wrap-break-word">
                            {session.batch_title}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableCell>

                  {/* ---------- Created By ---------- */}

                  <TableCell className="max-w-40">
                    <div className="flex items-center gap-2">
                      <span
                        title={session.creator_name ?? "-"}
                        className="truncate rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {session.creator_name ?? "-"}
                      </span>

                      {session.creator_name && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <Info className="size-3.5" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="max-w-sm wrap-break-word bg-card">
                            {session.creator_name}
                          </PopoverContent>
                        </Popover>
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
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* ---------- Start Time ---------- */}

                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(session.starts_at).toLocaleDateString()}
                    <span className="mx-1 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {new Date(session.starts_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
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
                  {/* ---------- Status ---------- */}

                  <TableCell>
                    <div
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-all capitalize select-none",

                        status === "waiting_for_link" &&
                          "border-slate-200 bg-slate-50/50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400",

                        status === "scheduled" &&
                          "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300",

                        status === "live" &&
                          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 font-semibold",

                        status === "ended" &&
                          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
                      )}
                    >
                      {status === "waiting_for_link" && "Waiting for Link"}

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
                            className="h-9 rounded-xl bg-destructive px-3  transition-all hover:bg-destructive/90 "
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
                              This action cannot be undone. The group session
                              and all selected students will be removed
                              permanently.
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
                                    queryKey: groupSessionsQueryKeys.lists(),
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
