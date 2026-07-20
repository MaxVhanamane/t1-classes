"use client";

import dynamic from "next/dynamic";

const MentorshipLiveRoom = dynamic(
  () => import("./mentorship-live-room").then((mod) => mod.MentorshipLiveRoom),
  {
    ssr: false,
  },
);

export interface VideoSdkLiveSessionProps {
  meetingId: string;
  token: string;
  endsAt: string;
  sessionId: string;
  participantName: string;
  isModerator: boolean;
  isSessionOwner: boolean;
  sessionTitle: string;
  sessionDescription: string | null;
}

export function LiveRoomClient({
  meetingId,
  token,
  participantName,
  isModerator,
  sessionId,
  endsAt,
  isSessionOwner,
  sessionTitle,
  sessionDescription,
}: VideoSdkLiveSessionProps) {
  return (
    <MentorshipLiveRoom
      meetingId={meetingId}
      token={token}
      participantName={participantName}
      isModerator={isModerator}
      sessionId={sessionId}
      endsAt={endsAt}
      isSessionOwner={isSessionOwner}
      sessionTitle={sessionTitle}
      sessionDescription={sessionDescription}
    />
  );
}
