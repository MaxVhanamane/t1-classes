"use client";

import dynamic from "next/dynamic";

const MentorshipLiveRoom = dynamic(
  () => import("./mentorship-live-room").then((mod) => mod.MentorshipLiveRoom),
  {
    ssr: false,
  },
);

interface LiveRoomClientProps {
  meetingId: string;

  token: string;
  endsAt: string;
  sessionId: string;

  participantName: string;

  isModerator: boolean;
  isSessionOwner: boolean;
}

export function LiveRoomClient({
  meetingId,
  token,
  participantName,
  isModerator,
  sessionId,
  endsAt,
  isSessionOwner,
}: LiveRoomClientProps) {
  return (
    <MentorshipLiveRoom
      meetingId={meetingId}
      token={token}
      participantName={participantName}
      isModerator={isModerator}
      sessionId={sessionId}
      endsAt={endsAt}
      isSessionOwner={isSessionOwner}
    />
  );
}
