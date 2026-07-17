"use client";

import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { MentorshipLiveRoom } from "./mentorship-live-room";
import { useEffect } from "react";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

interface AgoraProviderWrapperProps {
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

export function AgoraProviderWrapper(props: AgoraProviderWrapperProps) {
  useEffect(() => {
    return () => {
      void client.leave().catch(() => {});
    };
  }, []);
  return (
    <AgoraRTCProvider client={client}>
      <MentorshipLiveRoom {...props} />
    </AgoraRTCProvider>
  );
}
