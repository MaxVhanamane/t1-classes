"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
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
  sessionTitle: string;
}

export interface MeetingPreferences {
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
  sessionTitle,
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
  const [customMicrophoneAudioTrack, setCustomMicrophoneAudioTrack] =
    useState<Awaited<ReturnType<typeof createMicrophoneAudioTrack>> | null>(
      null,
    );
  /*
    Create HD custom camera track

    Required for proper
    VideoSDK adaptive quality.
  */
  useEffect(() => {
    let cancelled = false;

    const createTracks = async () => {
      try {
        const [cameraTrack, microphoneTrack] = await Promise.all([
          createCameraVideoTrack({
            cameraId: preferences.webcamId || undefined,
            encoderConfig: "h540p_w720p",
            optimizationMode: "motion",
            multiStream: false,
            bitrateMode: "high_quality",
          }),

          createMicrophoneAudioTrack({
            microphoneId: preferences.micId || undefined,
            encoderConfig: "speech_standard",
            noiseConfig: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }),
        ]);

        if (cancelled) {
          return;
        }

        setCustomCameraVideoTrack(cameraTrack);
        setCustomMicrophoneAudioTrack(microphoneTrack);
      } catch (error) {
        console.error("[CREATE_MEDIA_TRACKS_ERROR]", error);
      }
    };

    void createTracks();

    return () => {
      cancelled = true;
    };
  }, [preferences.webcamId, preferences.micId]);

  useEffect(() => {
    return () => {
      customCameraVideoTrack?.getTracks().forEach((track) => {
        track.stop();
      });

      customMicrophoneAudioTrack?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [customCameraVideoTrack, customMicrophoneAudioTrack]);
  /*
    Wait until custom track
    is initialized before
    mounting meeting provider.
  */
  if (!customCameraVideoTrack || !customMicrophoneAudioTrack) {
    return null;
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        name: participantName,
        micEnabled: preferences.micEnabled,
        webcamEnabled: preferences.webcamEnabled,
        customCameraVideoTrack,
        customMicrophoneAudioTrack,
        multiStream: false,
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
        sessionTitle={sessionTitle}
        preferences={preferences}
      />
    </MeetingProvider>
  );
}
