"use client";

import { MentorshipSessionCard } from "./mentorship-session-card";

import { StudentMentorshipSession } from "../../types/mentorship-session.types";

type Props = {
  items: StudentMentorshipSession[];
};

export function MentorshipSessionsList({ items }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((session) => (
        <MentorshipSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
