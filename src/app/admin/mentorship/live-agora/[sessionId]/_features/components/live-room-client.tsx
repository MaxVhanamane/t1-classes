"use client";

import dynamic from "next/dynamic";

// Dynamically import the wrapper with ssr: false
const AgoraProviderWrapper = dynamic(
  () =>
    import("./agora-provider-wrapper").then((mod) => mod.AgoraProviderWrapper),
  { ssr: false },
);

export interface LiveSessionProps {
  meetingId: string;
  token: string;
  endsAt: string;
  sessionId: string;
  numericUid: number;
  participantName: string;
  isModerator: boolean;
  isSessionOwner: boolean;
  sessionTitle: string;
  sessionDescription: string | null;
}

export function LiveRoomClient(props: LiveSessionProps) {
  return <AgoraProviderWrapper {...props} />;
}
