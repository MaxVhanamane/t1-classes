"use client";

import { Video } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";

import { StudentGroupSession } from "../../types/group-session.types";

type Props = {
  session: StudentGroupSession;
};

export function GroupSessionActionButton({ session }: Props) {
  if (session.canJoin) {
    return (
      <Button asChild className="h-11 w-full rounded-2xl text-sm font-medium">
        <Link href={`/student/group-session/live/${session.id}`}>
          <Video className="mr-2 size-4" />
          Join Session
        </Link>
      </Button>
    );
  }

  if (session.status === "scheduled" && !session.meetingId) {
    return (
      <Button
        disabled
        variant="secondary"
        className="h-11 w-full rounded-2xl text-sm font-medium"
      >
        Waiting for Link
      </Button>
    );
  }

  if (session.status === "scheduled") {
    return (
      <Button
        disabled
        variant="secondary"
        className="h-11 w-full rounded-2xl text-sm font-medium"
      >
        Starts Soon
      </Button>
    );
  }

  return (
    <Button
      disabled
      variant="outline"
      className="h-11 w-full rounded-2xl text-sm font-medium"
    >
      Session Ended
    </Button>
  );
}
