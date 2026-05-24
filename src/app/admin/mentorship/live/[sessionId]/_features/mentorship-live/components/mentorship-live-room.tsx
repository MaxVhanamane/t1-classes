"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createCameraVideoTrack,
  MeetingProvider,
} from "@videosdk.live/react-sdk";

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

  const [customCameraVideoTrack, setCustomCameraVideoTrack] = useState<Awaited<
    ReturnType<typeof createCameraVideoTrack>
  > | null>(null);

  /*
    Create HD custom camera track

    Required for proper
    VideoSDK adaptive quality.
  */
  useEffect(() => {
    const createTrack = async () => {
      try {
        const track = await createCameraVideoTrack({
          encoderConfig: "h540p_w960p",

          optimizationMode: "motion",

          multiStream: false,
          bitrateMode: "high_quality",
        });

        setCustomCameraVideoTrack(track);
      } catch (error) {
        console.error("[CREATE_CAMERA_TRACK_ERROR]", error);
      }
    };

    void createTrack();
  }, []);

  /*
    Wait until custom track
    is initialized before
    mounting meeting provider.
  */
  if (!customCameraVideoTrack) {
    return null;
  }

  return (
    <MeetingProvider
      config={{
        meetingId,

        micEnabled: preferences.micEnabled,

        webcamEnabled: preferences.webcamEnabled,

        name: participantName,

        debugMode: false,

        customCameraVideoTrack,
        multiStream: false,
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
