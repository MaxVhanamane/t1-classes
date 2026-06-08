"use client";

import { GroupSessionStatus } from "../../types/group-session.types";

type Props = {
  status: GroupSessionStatus;
};

export function GroupSessionsEmptyState({ status }: Props) {
  return (
    <div className="rounded-3xl border border-dashed p-10 text-center md:w-2xl">
      <h3 className="text-base font-semibold">
        {status === "live"
          ? "No live group sessions"
          : status === "scheduled"
            ? "No upcoming group sessions"
            : "No past group sessions"}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {status === "live"
          ? "Any ongoing group sessions for this batch will appear here."
          : status === "scheduled"
            ? "Upcoming group sessions for this batch will appear here."
            : "Completed group sessions for this batch will appear here."}
      </p>
    </div>
  );
}
