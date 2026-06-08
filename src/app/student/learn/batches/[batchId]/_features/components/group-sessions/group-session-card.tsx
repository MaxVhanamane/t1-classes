"use client";

import { format } from "date-fns";
import { CalendarDays, Clock3, Copy, User2 } from "lucide-react";

import { toast } from "sonner";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

import { GroupSessionActionButton } from "./group-session-action-button";

import { StudentGroupSession } from "../../types/group-session.types";

type Props = {
  session: StudentGroupSession;
};

export function GroupSessionCard({ session }: Props) {
  async function handleCopyPasscode() {
    if (!session.meetingPasscode) {
      return;
    }

    await navigator.clipboard.writeText(session.meetingPasscode);

    toast.success("Passcode copied");
  }

  return (
    <Card className="relative overflow-hidden rounded-3xl border bg-background p-5 dark:bg-black">
      <DottedBackground className="opacity-50" />

      <CardContent className="relative z-10 p-0">
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

          {session.status === "live" ? (
            <Badge className="border-0 bg-red-500 text-white hover:bg-red-500">
              Live
            </Badge>
          ) : session.status === "scheduled" && !session.meetingId ? (
            <Badge variant="secondary">Waiting for Link</Badge>
          ) : session.status === "scheduled" ? (
            <Badge variant="secondary">Scheduled</Badge>
          ) : (
            <Badge variant="outline">Ended</Badge>
          )}
        </div>

        {session.description && (
          <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {session.description}
          </p>
        )}

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
                onClick={handleCopyPasscode}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <GroupSessionActionButton session={session} />
        </div>
      </CardContent>
    </Card>
  );
}
