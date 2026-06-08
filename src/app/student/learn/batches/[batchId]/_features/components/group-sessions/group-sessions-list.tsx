"use client";

import { GroupSessionCard } from "./group-session-card";

import { StudentGroupSession } from "../../types/group-session.types";

type Props = {
  items: StudentGroupSession[];
};

export function GroupSessionsList({ items }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((session) => (
        <GroupSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
