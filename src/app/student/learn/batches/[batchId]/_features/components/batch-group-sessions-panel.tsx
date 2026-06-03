"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { CalendarDays, Clock3, Copy, User2, Video } from "lucide-react";

import { format } from "date-fns";

import { Badge } from "@/src/components/ui/badge";

import { Button } from "@/src/components/ui/button";

import { Link } from "@/src/components/ui/link";

import DottedBackground from "@/src/components/dotted-background";

import { Card, CardContent } from "@/src/components/ui/card";
import { toast } from "sonner";

interface StudentGroupSession {
  id: string;

  title: string;

  description: string | null;

  startsAt: string;

  expectedDurationMinutes: number | null;

  audienceType: "batch" | "selected_students";

  teacherName: string;

  meetingId: string | null;
  meetingPasscode: string | null;

  status: "scheduled" | "live" | "ended" | "waiting_for_link";

  canJoin: boolean;
}

interface StudentGroupSessionsResponse {
  items: StudentGroupSession[];

  page: number;

  total: number;

  totalPages: number;

  pageSize: number;
}

interface Props {
  batchId: string;
}

async function fetchGroupSessions(
  batchId: string,
  page: number,
): Promise<StudentGroupSessionsResponse> {
  const response = await fetch(
    `/api/batches/${batchId}/group-sessions?page=${page}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch group sessions");
  }

  return response.json();
}

function SessionStatusBadge({
  status,
}: {
  status: "scheduled" | "live" | "ended" | "waiting_for_link";
}) {
  if (status === "live") {
    return (
      <Badge className="border-0 bg-red-500 text-white hover:bg-red-500">
        Live
      </Badge>
    );
  }

  if (status === "waiting_for_link") {
    return <Badge variant="secondary">Waiting for Link</Badge>;
  }

  if (status === "scheduled") {
    return <Badge variant="secondary">Scheduled</Badge>;
  }

  return <Badge variant="outline">Ended</Badge>;
}

function GroupSessionCard({ session }: { session: StudentGroupSession }) {
  const copyPasscode = async () => {
    if (!session.meetingPasscode) {
      return;
    }

    await navigator.clipboard.writeText(session.meetingPasscode);

    toast.success("Passcode copied");
  };
  return (
    <Card className="relative overflow-hidden rounded-3xl border dark:bg-black bg-background p-5">
      <DottedBackground className="opacity-50" />

      <CardContent className="relative z-10 p-0">
        {/* ---------- Top ---------- */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-xl font-semibold tracking-tight">
                {session.title}
              </h3>

              {session.audienceType === "selected_students" && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-[11px]"
                >
                  Personal
                </Badge>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <User2 className="size-4 shrink-0" />

              <span className="text-muted-foreground/80">Host</span>

              <span className="truncate font-medium text-foreground">
                {session.teacherName}
              </span>
            </div>
          </div>

          <SessionStatusBadge status={session.status} />
        </div>

        {/* ---------- Description ---------- */}

        {session.description && (
          <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {session.description}
          </p>
        )}

        {/* ---------- Meta ---------- */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Session Date
            </div>

            <p className="mt-2 text-sm font-medium text-foreground">
              {format(new Date(session.startsAt), "dd MMM yyyy")}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {format(new Date(session.startsAt), "hh:mm a")}
            </p>
          </div>

          <div className="rounded-2xl border bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock3 className="size-3.5" />
              Duration
            </div>

            <p className="mt-2 text-sm font-medium text-foreground">
              {session.expectedDurationMinutes
                ? `${session.expectedDurationMinutes} Minutes`
                : "Flexible"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">Group Session</p>
          </div>
        </div>

        {session.meetingPasscode && (
          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-500">
                  Zoom Passcode
                </p>

                <p className="mt-2 text-lg font-semibold tracking-wider text-foreground">
                  {session.meetingPasscode}
                </p>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Use this only if Zoom asks you to enter a passcode while
                  joining.
                </p>
              </div>

              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="shrink-0 rounded-xl"
                onClick={copyPasscode}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ---------- Footer ---------- */}

        <div className="mt-6">
          {session.canJoin ? (
            <Button
              asChild
              className="h-11 w-full rounded-2xl text-sm font-medium"
            >
              <Link href={`/student/group-session/live/${session.id}`}>
                <Video className="mr-2 size-4" />
                Join Session
              </Link>
            </Button>
          ) : session.status === "waiting_for_link" ? (
            <Button
              disabled
              variant="secondary"
              className="h-11 w-full rounded-2xl text-sm font-medium"
            >
              Waiting for Link
            </Button>
          ) : session.status === "scheduled" ? (
            <Button
              disabled
              variant="secondary"
              className="h-11 w-full rounded-2xl text-sm font-medium"
            >
              Starts Soon
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              className="h-11 w-full rounded-2xl text-sm font-medium"
            >
              Session Ended
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BatchGroupSessionsPanel({ batchId }: Props) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-group-sessions", batchId, page],

    queryFn: () => fetchGroupSessions(batchId, page),

    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (data && page > data.totalPages && data.totalPages > 0) {
      setTimeout(() => {
        setPage(data.totalPages);
      }, 0);
    }
  }, [data, page]);

  /* ---------- Loading ---------- */

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="relative overflow-hidden rounded-3xl border bg-background p-5"
          >
            <DottedBackground className="opacity-50" />

            <CardContent className="relative z-10 p-0">
              {/* Top */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-44 animate-pulse rounded-md bg-muted" />

                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />

                    <div className="h-4 w-10 animate-pulse rounded bg-muted" />

                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </div>

                <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              </div>

              {/* Description */}
              {/* <div className="mt-5 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-[75%] animate-pulse rounded bg-muted" />
              </div> */}

              {/* Meta Cards */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-white/5 p-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />

                  <div className="mt-3 h-4 w-24 animate-pulse rounded bg-muted" />

                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
                </div>

                <div className="rounded-2xl border bg-white/5 p-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />

                  <div className="mt-3 h-4 w-24 animate-pulse rounded bg-muted" />

                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>

              {/* Zoom Passcode Section */}
              <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />

                    <div className="mt-3 h-7 w-28 animate-pulse rounded bg-muted" />

                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-3 w-[80%] animate-pulse rounded bg-muted" />
                  </div>

                  <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6">
                <div className="h-11 w-full animate-pulse rounded-2xl bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /* ---------- Error ---------- */

  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load group sessions.
      </div>
    );
  }

  /* ---------- Empty ---------- */

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed p-10 text-center">
        <h3 className="text-base font-semibold">No group sessions</h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Group sessions for this batch will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------- Grid ---------- */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map((session) => (
          <GroupSessionCard key={session.id} session={session} />
        ))}
      </div>

      {/* ---------- Pagination ---------- */}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => {
              setPage((prev) => prev - 1);
            }}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </div>

          <Button
            variant="outline"
            disabled={page === data.totalPages}
            onClick={() => {
              setPage((prev) => prev + 1);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
