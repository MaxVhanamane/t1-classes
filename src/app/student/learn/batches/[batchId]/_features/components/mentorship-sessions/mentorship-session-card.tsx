"use client";

import { format } from "date-fns";
import { CalendarDays, Clock3, User2 } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import DottedBackground from "@/src/components/dotted-background";

import { MentorshipSessionActionButton } from "./mentorship-session-action-button";

import { StudentMentorshipSession } from "../../types/mentorship-session.types";

type Props = {
  session: StudentMentorshipSession;
};

export function MentorshipSessionCard({ session }: Props) {
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

          <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
            <User2 className="size-3.5 shrink-0" />
            <span className="text-muted-foreground/80">Mentor:</span>
            <span className="truncate font-medium text-foreground">
              {session.teacherName}
            </span>
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
              {session.durationMinutes} Minutes
            </p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-muted-foreground">
              Mentorship Session
            </p>
          </div>
        </div>

        {/* Footer Actions (Pushed to bottom, strictly right-aligned) */}
        <div className="mt-auto pt-5 flex items-center justify-end">
          <MentorshipSessionActionButton session={session} />
        </div>
      </CardContent>
    </Card>
  );
}
