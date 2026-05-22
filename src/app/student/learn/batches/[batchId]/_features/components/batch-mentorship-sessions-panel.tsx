"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { CalendarDays, Clock3, User2, Video } from "lucide-react";

import { format } from "date-fns";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

import { Link } from "@/src/components/ui/link";
import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";

interface StudentMentorshipSession {
  id: string;

  title: string;

  description: string | null;

  startsAt: string;

  endsAt: string;

  durationMinutes: number;

  audienceType: "batch" | "selected_students";

  teacherName: string;

  meetingId: string | null;

  status: "scheduled" | "live" | "ended";

  canJoin: boolean;
}

interface StudentMentorshipSessionsResponse {
  items: StudentMentorshipSession[];

  page: number;

  total: number;

  totalPages: number;

  pageSize: number;
}

interface Props {
  batchId: string;
}

async function fetchMentorshipSessions(
  batchId: string,
  page: number,
): Promise<StudentMentorshipSessionsResponse> {
  const response = await fetch(
    `/api/batches/${batchId}/mentorship-sessions?page=${page}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch mentorship sessions");
  }

  return response.json();
}

function SessionStatusBadge({
  status,
}: {
  status: "scheduled" | "live" | "ended";
}) {
  if (status === "live") {
    return (
      <Badge className="border-0 bg-red-500 text-white hover:bg-red-500">
        Live
      </Badge>
    );
  }

  if (status === "scheduled") {
    return <Badge variant="secondary">Scheduled</Badge>;
  }

  return <Badge variant="outline">Ended</Badge>;
}

function MentorshipSessionCard({
  session,
}: {
  session: StudentMentorshipSession;
}) {
  return (
    <Card className="relative overflow-hidden rounded-3xl border bg-black p-5 ">
      <DottedBackground className="opacity-50" />

      <CardContent className="relative z-10 p-0">
        {/* Top */}
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

              <span className="text-muted-foreground/80">Mentor</span>

              <span className="truncate font-medium text-foreground">
                {session.teacherName}
              </span>
            </div>
          </div>

          <SessionStatusBadge status={session.status} />
        </div>

        {/* Description */}
        {session.description && (
          <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {session.description}
          </p>
        )}

        {/* Meta Section */}
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
              {session.durationMinutes} Minutes
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Mentorship Session
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6">
          {session.canJoin ? (
            <Button
              asChild
              className="h-11 w-full rounded-2xl text-sm font-medium"
            >
              <Link href={`/student/mentorship/setup/${session.id}`}>
                <Video className="mr-2 size-4" />
                Join Live Session
              </Link>
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

export default function BatchMentorshipSessionsPanel({ batchId }: Props) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-mentorship-sessions", batchId, page],

    queryFn: () => fetchMentorshipSessions(batchId, page),

    staleTime: 1000 * 30,
  });

  /* Prevent users from getting stuck on an invalid page
   if total pages shrink after data changes */
  /* Example:
   User is on page 6, but later total sessions shrink and only 2 pages exist.
   Without this effect, page 6 would stay selected and show an empty screen forever.
   This moves the user back to the last valid page automatically. */
  useEffect(() => {
    if (data && page > data.totalPages && data.totalPages > 0) {
      setTimeout(() => {
        setPage(data.totalPages);
      }, 0);
    }
  }, [data, page]);

  /* -------------------------------------------- */
  /* Loading */
  /* -------------------------------------------- */

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-3xl border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  /* -------------------------------------------- */
  /* Error */
  /* -------------------------------------------- */

  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load mentorship sessions.
      </div>
    );
  }

  /* -------------------------------------------- */
  /* Empty */
  /* -------------------------------------------- */

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed p-10 text-center">
        <h3 className="text-base font-semibold">No mentorship sessions</h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Mentorship sessions for this batch will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map((session) => (
          <MentorshipSessionCard key={session.id} session={session} />
        ))}
      </div>

      {/* Pagination */}
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
