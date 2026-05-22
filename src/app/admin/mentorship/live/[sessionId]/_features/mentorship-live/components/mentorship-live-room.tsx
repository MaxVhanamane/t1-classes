"use client";

import { useMemo } from "react";

import { MeetingProvider } from "@videosdk.live/react-sdk";

import { MentorshipMeetingView } from "./mentorship-meeting-view";

interface MentorshipLiveRoomProps {
  meetingId: string;

  token: string;

  sessionId: string;

  endsAt: string;

  participantName: string;

  isModerator: boolean;

  isSessionOwner: boolean;
}

interface MeetingPreferences {
  micEnabled: boolean;

  webcamEnabled: boolean;

  micId: string;

  webcamId: string;

  speakerId: string;
}

const DEFAULT_PREFERENCES: MeetingPreferences = {
  micEnabled: true,

  webcamEnabled: true,

  micId: "",

  webcamId: "",

  speakerId: "",
};

export function MentorshipLiveRoom({
  meetingId,
  token,
  participantName,
  isModerator,
  sessionId,
  endsAt,
  isSessionOwner,
}: MentorshipLiveRoomProps) {
  const preferences = useMemo<MeetingPreferences>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_PREFERENCES;
    }

    try {
      const stored = sessionStorage.getItem("mentorship-meeting-preferences");

      if (!stored) {
        return DEFAULT_PREFERENCES;
      }

      return {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(stored),
      };
    } catch (error) {
      console.error("[MEETING_PREFERENCES_PARSE_ERROR]", error);

      return DEFAULT_PREFERENCES;
    }
  }, []);

  return (
    <MeetingProvider
      config={{
        meetingId,

        micEnabled: preferences.micEnabled,

        webcamEnabled: preferences.webcamEnabled,

        name: participantName,

        debugMode: false,
      }}
      token={token}
    >
      <MentorshipMeetingView
        isModerator={isModerator}
        leaveRedirectHref="/admin/mentorship_sessions"
        sessionId={sessionId}
        endsAt={endsAt}
        isSessionOwner={isSessionOwner}
      />
    </MeetingProvider>
  );
}
