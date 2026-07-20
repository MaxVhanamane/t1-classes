"use client";

import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { MentorshipLiveRoom } from "./mentorship-live-room";
import { useEffect } from "react";
import { LiveSessionProps } from "./live-room-client";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export function AgoraProviderWrapper(props: LiveSessionProps) {
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
