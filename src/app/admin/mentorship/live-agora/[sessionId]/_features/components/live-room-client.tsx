"use client";

import dynamic from "next/dynamic";

// Dynamically import the wrapper with ssr: false
const AgoraProviderWrapper = dynamic(
  () =>
    import("./agora-provider-wrapper").then((mod) => mod.AgoraProviderWrapper),
  { ssr: false },
);

interface LiveRoomClientProps {
  meetingId: string;
  token: string;
  endsAt: string;
  sessionId: string;
  numericUid: number;
  participantName: string;
  isModerator: boolean;
  isSessionOwner: boolean;
  sessionTitle: string;
}

export function LiveRoomClient(props: LiveRoomClientProps) {
  return <AgoraProviderWrapper {...props} />;
}
