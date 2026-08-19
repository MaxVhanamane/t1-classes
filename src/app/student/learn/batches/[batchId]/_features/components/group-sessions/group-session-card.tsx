"use client";

import { format } from "date-fns";
import { CalendarDays, Clock3, Copy, User2, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { RichPopover } from "@/src/components/ui/common/rich-popover";

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
    <Card className="relative flex flex-col overflow-hidden rounded-3xl border bg-background p-4 sm:p-5 transition hover:bg-muted/40 dark:bg-black">
      {/* Background Pattern */}
      <DottedBackground className="opacity-50" />

      {/* Main Content Area */}
      <CardContent className="relative z-10 flex flex-col flex-1 p-0">
        {/* Top Header Section */}
        <div className="min-w-0 w-full">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold tracking-tight">
            {session.title}
          </h3>

          <div className="mt-2.5 flex items-center gap-3 w-full text-[11px] sm:text-xs text-muted-foreground">
            {/* Host Info - FIRST */}
            <div className="flex items-center gap-1.5 min-w-0 shrink">
              <User2 className="size-3.5 shrink-0" />
              <span className="text-muted-foreground/80 shrink-0">Host:</span>
              <span className="truncate font-medium text-foreground">
                {session.teacherName}
              </span>
            </div>

            {/* Interactive Personal Badge - SECOND */}
            {session.audienceType === "selected_students" && (
              <div className="shrink-0">
                <RichPopover
                  color="blue"
                  title="Personal Session"
                  description="This session is not for the whole batch. It is exclusively for selected students."
                  trigger={
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors focus:outline-none"
                    >
                      <Info className="size-3 shrink-0" />
                      Personal
                    </button>
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        {session.description && (
          <p className="mt-3.5 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
            {session.description}
          </p>
        )}

        {/* Metadata Cards Grid */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {/* Date Card */}
          <div className="rounded-2xl border bg-white/5 p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="size-3" />
              Session Date
            </div>
            <p className="mt-1.5 text-[11px] sm:text-xs font-semibold text-foreground">
              {format(new Date(session.startsAt), "dd MMM yyyy")}
            </p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-muted-foreground">
              {format(new Date(session.startsAt), "hh:mm a")}
            </p>
          </div>

          {/* Duration Card */}
          <div className="rounded-2xl border bg-white/5 p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              <Clock3 className="size-3" />
              Duration
            </div>
            <p className="mt-1.5 text-[11px] sm:text-xs font-semibold text-foreground">
              {session.expectedDurationMinutes
                ? `${session.expectedDurationMinutes} Minutes`
                : "Flexible"}
            </p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-muted-foreground">
              Group Session
            </p>
          </div>
        </div>

        {/* Compact Zoom Passcode Box */}
        {session.meetingPasscode && (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                  Zoom Passcode
                </p>
                <p className="mt-1 text-sm sm:text-base font-semibold tracking-wider text-foreground">
                  {session.meetingPasscode}
                </p>
                <p className="mt-1 text-[9px] sm:text-[10px] leading-relaxed text-muted-foreground">
                  Use this only if Zoom asks you to enter a passcode while
                  joining.
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="shrink-0 rounded-xl size-8 sm:size-9"
                onClick={handleCopyPasscode}
              >
                <Copy className="size-3.5 sm:size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions (Pushed to bottom, right-aligned) */}
        <div className="mt-auto pt-5 flex items-center justify-end">
          <GroupSessionActionButton session={session} />
        </div>
      </CardContent>
    </Card>
  );
}
