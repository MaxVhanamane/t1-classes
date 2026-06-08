"use client";

import { CalendarDays } from "lucide-react";

import { MentorshipSessionStatus } from "../../types/mentorship-session.types";

type Props = {
  status: MentorshipSessionStatus;
};

export function MentorshipSessionsEmptyState({ status }: Props) {
  const content = {
    live: {
      title: "No live mentorship sessions",
      description: "There are no mentorship sessions happening right now.",
    },

    scheduled: {
      title: "No upcoming mentorship sessions",
      description:
        "Upcoming mentorship sessions for this batch will appear here.",
    },

    ended: {
      title: "No completed mentorship sessions",
      description:
        "Completed mentorship sessions will appear here once available.",
    },
  } satisfies Record<
    MentorshipSessionStatus,
    {
      title: string;
      description: string;
    }
  >;

  return (
    <div className="rounded-lg border border-dashed md:w-2xl">
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <CalendarDays className="size-10 text-muted-foreground" />

        <div>
          <h3 className="font-medium">{content[status].title}</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {content[status].description}
          </p>
        </div>
      </div>
    </div>
  );
}
