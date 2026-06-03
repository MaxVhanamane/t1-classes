import { AttendanceSessionListItem } from "../../types/attendance";

import { AttendanceHistoryCard } from "./attendance-history-card";

type AttendanceHistoryListProps = {
  sessions: AttendanceSessionListItem[];

  onView: (sessionId: string) => void;
};

export function AttendanceHistoryList({
  sessions,
  onView,
}: AttendanceHistoryListProps) {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <AttendanceHistoryCard
          key={session.id}
          session={session}
          onView={onView}
        />
      ))}
    </div>
  );
}
