"use client";

import { Video } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";

import { StudentMentorshipSession } from "../../types/mentorship-session.types";

type Props = {
  session: StudentMentorshipSession;
};

export function MentorshipSessionActionButton({ session }: Props) {
  const startTimePassed = new Date(session.startsAt) <= new Date();

  const isWaitingForTeacher =
    session.status === "scheduled" && startTimePassed && !session.meetingId;

  if (session.canJoin) {
    return (
      <Button asChild className="h-10 w-full text-sm font-medium rounded-xl">
        <Link href={`/student/mentorship/setup/${session.id}`}>
          <Video className="mr-2 size-4" />
          Join Session
        </Link>
      </Button>
    );
  }

  if (isWaitingForTeacher) {
    return (
      <div className="space-y-2">
        <Button
          disabled
          variant="secondary"
          className="h-10 w-full text-sm font-medium rounded-xl"
        >
          Waiting for Teacher
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          The teacher has not started the meeting yet.
        </p>
      </div>
    );
  }

  if (session.status === "scheduled") {
    return (
      <Button
        disabled
        variant="secondary"
        className="h-10 w-full text-sm font-medium rounded-xl"
      >
        Starts Soon
      </Button>
    );
  }

  return (
    <Button
      disabled
      variant="outline"
      className="h-10 w-full text-sm font-medium rounded-xl"
    >
      Session Ended
    </Button>
  );
}
