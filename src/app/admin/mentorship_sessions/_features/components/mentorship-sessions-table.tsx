"use client";

import { useState } from "react";
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
import {
  Pencil,
  Play,
  Trash2,
  ArrowRight,
  Radio,
  Clock,
  Check,
  Info,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

type Props = {
  sessions: MentorshipSession[];
};

export function MentorshipSessionsTable({ sessions }: Props) {
  const router = useRouter();

  const [selectedSession, setSelectedSession] = useState<
    MentorshipSession | undefined
  >();

  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // prevents spam clicking across all actions
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

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="sticky left-0 z-20 w-16 bg-secondary text-center font-medium">
                  No.
                </TableHead>
                <TableHead className="min-w-[260px]">Session Title</TableHead>
                <TableHead className="min-w-[260px]">Description</TableHead>
                <TableHead className="min-w-[260px]">Batch</TableHead>
                <TableHead className="min-w-[260px]">Created By</TableHead>

                {/* <TableHead>Audience</TableHead> */}

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
              {sessions.map((session, index) => {
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
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="sticky left-0 z-20 w-14 min-w-14 bg-card text-center font-semibold transition-colors group-hover:bg-muted/0">
                      {index + 1}
                    </TableCell>
                    <TableCell className="max-w-25">
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

                          <PopoverContent className="max-w-sm wrap-break-word">
                            {session.title}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-35">
                      <div className="flex items-center gap-2">
                        {session.description ? (
                          <p
                            title={session.description}
                            className="truncate text-sm text-muted-foreground"
                          >
                            {session.description}
                          </p>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-dashed border-muted-foreground/30 bg-muted/50 px-2 py-0.5 text-xs font-medium italic text-muted-foreground">
                            No description
                          </span>
                        )}

                        {session.description && (
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
                              {session.description}
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-30">
                      <div className="flex items-center gap-2">
                        <span
                          title={session.batch_title ?? "-"}
                          className="truncate rounded-md border border-sky-200/60 bg-sky-50/80 px-2 py-1 text-xs font-medium text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-300"
                        >
                          {session.batch_title}
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

                    <TableCell className="max-w-30">
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

                            <PopoverContent className="max-w-sm wrap-break-word">
                              {session.creator_name}
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>

                    {/* <TableCell className="capitalize">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {session.audience_type}
                        </span>
                      </TableCell> */}

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
                          {new Date(session.starts_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p>{new Date(session.ends_at).toLocaleDateString()}</p>

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
                          // Layout & Base Styling: Removed min-w for a natural hug. Softened shadow and adjusted padding.
                          "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide  backdrop-blur-[2px] transition-all duration-200 capitalize select-none",

                          // Scheduled: Clean, muted slate/gray look
                          status === "scheduled" &&
                            "border-slate-200 bg-slate-50/50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400",

                          // Ready: Sophisticated deep indigo/sapphire vibe instead of loud sky-blue
                          status === "ready" &&
                            "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300",

                          // Live: Elegant mint/emerald with soft glowing undertones
                          status === "live" &&
                            "border-emerald-500/20 bg-emerald-500/6 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/8 dark:text-emerald-400 font-semibold",

                          status === "completed" &&
                            "border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/10 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300",
                        )}
                      >
                        {status === "live" && (
                          <Radio className="size-3 animate-pulse fill-current opacity-90" />
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
                                toast.error(error, { id: toastId });
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
                            "h-9 rounded-xl border-0 px-4 font-medium transition-all",
                            isStarting
                              ? "bg-emerald-500/80 text-white"
                              : "bg-emerald-600 text-white hover:bg-emerald-700",
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
                          className="h-9 rounded-xl border-0 bg-sky-600 px-4 font-medium text-white  transition-all hover:bg-sky-700"
                        >
                          <ArrowRight className="mr-2 size-4" />
                          Join Live
                        </Button>
                      )}
                      {status === "completed" && (
                        <div className="inline-flex cursor-default select-none items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-800/40 dark:text-zinc-300">
                          <Check className="size-3.5 text-zinc-500 dark:text-zinc-400" />
                          Session ended
                        </div>
                      )}

                      {status === "scheduled" && (
                        <div className="inline-flex cursor-default select-none items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50/50 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-transparent dark:text-slate-400">
                          <Clock className="size-3.5 text-slate-400 dark:text-slate-500" />
                          Not started yet
                        </div>
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
                              className="h-9 rounded-xl bg-destructive px-3 transition-all hover:bg-destructive/90"
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
    </>
  );
}
