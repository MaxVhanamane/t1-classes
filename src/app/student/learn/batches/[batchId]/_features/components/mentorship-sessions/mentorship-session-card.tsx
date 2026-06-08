"use client";

import { format } from "date-fns";
import { CalendarDays, Clock3, User2 } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

import { MentorshipSessionActionButton } from "./mentorship-session-action-button";

import { StudentMentorshipSession } from "../../types/mentorship-session.types";

type Props = {
  session: StudentMentorshipSession;
};

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

export function MentorshipSessionCard({ session }: Props) {
  return (
    <Card className="relative overflow-hidden rounded-3xl border bg-background p-5 transition hover:bg-muted/40 dark:bg-black">
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
          <MentorshipSessionActionButton session={session} />
        </div>
      </CardContent>
    </Card>
  );
}
