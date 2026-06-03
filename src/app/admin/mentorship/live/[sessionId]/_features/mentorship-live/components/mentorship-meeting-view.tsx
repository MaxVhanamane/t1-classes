"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { createCameraVideoTrack, usePubSub } from "@videosdk.live/react-sdk";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2 } from "lucide-react";

import { toast } from "sonner";

import { callServerAction } from "@/src/lib/actions/call-server-action";

import { endMentorshipSession } from "../../../actions/end-mentorship-session";

import { MentorshipParticipantTile } from "./mentorship-participant-tile";
import { MentorshipMeetingChat } from "./mentorship-meeting-chat";
import { useParticipantQuality } from "../../../hoooks/use-participant-quality";
import { cn } from "@/src/lib/utils";
import { MeetingHeader } from "./meeting-header";
import { MeetingControls } from "./meeting-controls";

type MeetingExitReason =
  | "manual_leave"
  | "meeting_ended"
  | "disconnected"
  | null;

interface MentorshipMeetingViewProps {
  isModerator: boolean;
  isSessionOwner: boolean;

  endsAt: string;

  leaveRedirectHref: string;

  sessionId: string;
  sessionTitle: string;
}

export function MentorshipMeetingView({
  isModerator,
  leaveRedirectHref,
  sessionId,
  endsAt,
  isSessionOwner,
  sessionTitle,
}: MentorshipMeetingViewProps) {
  const router = useRouter();

  const [hasJoined, setHasJoined] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const hasInitializedRef = useRef(false);

  const joinedRef = useRef(false);

  const isEndingMeetingRef = useRef(false);
  const [raisedHands, setRaisedHands] = useState<
    Record<
      string,
      {
        participantId: string;
        participantName: string;
        raisedAt: number;
      }
    >
  >({});
  const [meetingExitReason, setMeetingExitReason] =
    useState<MeetingExitReason>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const {
    join,

    leave,

    end,

    participants,

    localParticipant,

    localMicOn,

    localWebcamOn,

    toggleMic,

    toggleWebcam,
    localScreenShareOn,
    toggleScreenShare,
    changeMic,
    changeWebcam,
  } = useMeeting({
    onMeetingJoined() {
      setHasJoined(true);
    },
    onMeetingLeft() {
      switch (meetingExitReason) {
        case "meeting_ended":
          toast.success("Meeting ended");
          break;

        case "manual_leave":
          toast.success("You left the meeting");
          break;

        default:
          toast.info("Disconnected from meeting");
      }

      router.replace(leaveRedirectHref);
    },

    onError(error) {
      toast.error(error.message);
      console.error("[MEETING_ERROR]", error);
    },
  });

  const handleToggleWebcam = async () => {
    if (localWebcamOn) {
      toggleWebcam(); // turning off, no track needed
      return;
    }

    // turning on — always create a fresh track, never reuse
    try {
      const freshTrack = await createCameraVideoTrack({
        encoderConfig: "h540p_w720p",
        optimizationMode: "motion",
        multiStream: false,
        bitrateMode: "high_quality",
      });

      toggleWebcam(freshTrack);
    } catch (error) {
      console.error("[TOGGLE_WEBCAM_ERROR]", error);
      toast.error("Failed to start camera");
    }
  };

  const { publish: publishRaiseHand } = usePubSub("RAISE_HAND", {
    onMessageReceived(message) {
      try {
        const data = JSON.parse(message.message);

        const isLocalUser = data.participantId === localParticipant?.id;

        if (data.type === "HAND_RAISED") {
          setRaisedHands((prev) => ({
            ...prev,
            [data.participantId]: {
              participantId: data.participantId,
              participantName: data.participantName,
              raisedAt: data.raisedAt,
            },
          }));

          toast.info(
            isLocalUser
              ? "You raised your hand ✋"
              : `${data.participantName} raised their hand ✋`,
          );
        }

        if (data.type === "HAND_LOWERED") {
          setRaisedHands((prev) => {
            const updated = { ...prev };

            delete updated[data.participantId];

            return updated;
          });

          toast.info(
            isLocalUser
              ? "You lowered your hand"
              : `${data.participantName} lowered their hand`,
          );
        }
      } catch (error) {
        console.error("[RAISE_HAND_EVENT_ERROR]", error);
      }
    },
  });

  const { publish: publishMeetingEnded } = usePubSub("MEETING_EVENTS", {
    onMessageReceived(message) {
      try {
        const data = JSON.parse(message.message);

        if (data.type === "MEETING_ENDED") {
          setMeetingExitReason("meeting_ended");
        }
      } catch (error) {
        console.error("[MEETING_EVENT_PARSE_ERROR]", error);
      }
    },
  });

  const localParticipantQuality = useParticipantQuality(
    localParticipant?.id ?? "",
  );

  const performMeetingEnd = useCallback(async () => {
    console.log("performMeetingEnd called");
    if (isEndingMeetingRef.current) return false;

    isEndingMeetingRef.current = true;
    setIsEndingMeeting(true);

    try {
      console.log("endMentorshipSession called");
      const response = await Promise.race([
        callServerAction(endMentorshipSession({ sessionId })),
        new Promise<{ data: null; error: string }>((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: null,
                error: "Request timed out, please try again",
              }),
            10000, // 10 seconds then reset
          ),
        ),
      ]);

      if (response.error) {
        toast.error(response.error);
        return false;
      }

      setMeetingExitReason("meeting_ended");

      await publishMeetingEnded(JSON.stringify({ type: "MEETING_ENDED" }), {
        persist: false,
      });

      end();
      return true;
    } catch (error) {
      console.error("[END_MEETING_ERROR]", error);
      toast.error("Something went wrong. Please try again.");
      return false;
    } finally {
      // Always runs — resets button state no matter what
      isEndingMeetingRef.current = false;
      setIsEndingMeeting(false);
    }
  }, [end, sessionId, publishMeetingEnded]);

  const handleManualEndMeeting = useCallback(async () => {
    const success = await performMeetingEnd();

    if (!success) {
      return;
    }
  }, [performMeetingEnd]);

  const handleLeaveMeeting = useCallback(async () => {
    try {
      /*
      Owner leaving should end
      the meeting for everyone.
    */
      if (isSessionOwner) {
        setMeetingExitReason("meeting_ended");

        await callServerAction(
          endMentorshipSession({
            sessionId,
          }),
        );
        await publishMeetingEnded(
          JSON.stringify({
            type: "MEETING_ENDED",
          }),
          {
            persist: false,
          },
        );
        end();

        return;
      }

      /*
      Normal participant leave
    */
      setMeetingExitReason("manual_leave");

      leave();
    } catch (error) {
      console.error("[LEAVE_MEETING_ERROR]", error);
    }
  }, [leave, end, isSessionOwner, sessionId, publishMeetingEnded]);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    const timeout = setTimeout(() => {
      if (joinedRef.current) {
        return;
      }

      joinedRef.current = true;

      join();
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [join]);

  //   const handleBeforeUnload = useCallback(() => {
  //     setMeetingExitReason(null);

  //     leave();
  //   }, [leave]);

  //   useEffect(() => {
  //     window.addEventListener("beforeunload", handleBeforeUnload);

  //     return () => {
  //       window.removeEventListener("beforeunload", handleBeforeUnload);
  //     };
  //   }, [handleBeforeUnload]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("mentorship-meeting-preferences");

      if (!stored || !hasJoined) {
        return;
      }

      const preferences = JSON.parse(stored);

      /*
      Apply selected microphone
    */
      if (preferences.micId) {
        changeMic(preferences.micId);
      }
      /*
      Apply selected webcam
    */
      if (preferences.webcamId) {
        changeWebcam(preferences.webcamId);
      }
    } catch (error) {
      console.error("[APPLY_DEVICE_PREFERENCES_ERROR]", error);
    }
  }, [hasJoined, changeMic, changeWebcam]);

  useEffect(() => {
    if (!hasJoined) {
      return;
    }

    try {
      const current = JSON.parse(
        sessionStorage.getItem("mentorship-meeting-preferences") ?? "{}",
      );

      sessionStorage.setItem(
        "mentorship-meeting-preferences",
        JSON.stringify({
          ...current,
          micEnabled: localMicOn,
          webcamEnabled: localWebcamOn,
        }),
      );
    } catch (error) {
      console.error("[SAVE_MEDIA_STATE_ERROR]", error);
    }
  }, [hasJoined, localMicOn, localWebcamOn]);

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      setAudioDevices(devices.filter((device) => device.kind === "audioinput"));

      setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
    } catch (error) {
      console.error("[LOAD_MEDIA_DEVICES_ERROR]", error);
    }
  };

  useEffect(() => {
    if (!hasJoined) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadDevices();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [hasJoined]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return;
    }

    navigator.mediaDevices.addEventListener("devicechange", loadDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
    };
  }, []);

  const participantIds = useMemo(() => {
    const allParticipants = [
      localParticipant,
      ...Array.from(participants.values()),
    ].filter(Boolean);

    /*
    Deduplicate reconnecting users
    using displayName.

    Ideally use your real userId
    if available.
  */
    const uniqueParticipants = allParticipants.reduce<typeof allParticipants>(
      (acc, participant) => {
        const alreadyExists = acc.some(
          (p) => p?.displayName === participant?.displayName,
        );

        if (!alreadyExists) {
          acc.push(participant);
        }

        return acc;
      },
      [],
    );

    const getParticipantScore = (
      participant: typeof localParticipant | undefined,
    ) => {
      if (!participant) {
        return 0;
      }

      let value = 0;

      if (participant.screenShareOn) {
        value += 100;
      }

      if (participant.local) {
        value += 50;
      }

      if (participant.webcamOn) {
        value += 10;
      }

      return value;
    };

    return uniqueParticipants
      .sort((a, b) => getParticipantScore(b) - getParticipantScore(a))
      .map((participant) => participant!.id);
  }, [localParticipant, participants]);

  const handleCountdownExpire = useCallback(() => {
    if (!isSessionOwner) return;
    void performMeetingEnd();
  }, [isSessionOwner, performMeetingEnd]);

  const isConnecting = !hasJoined && participantIds.length === 0;

  const isWaitingForOthers = hasJoined && participantIds.length <= 1;

  const hasRaisedHand = !!raisedHands[localParticipant?.id ?? ""];

  const handleChangeMic = useCallback(
    (deviceId: string) => {
      try {
        changeMic(deviceId);

        const device = audioDevices.find(
          (device) => device.deviceId === deviceId,
        );

        toast.success(
          `Microphone changed to ${device?.label ?? "Unknown Microphone"}`,
        );

        const current = JSON.parse(
          sessionStorage.getItem("mentorship-meeting-preferences") ?? "{}",
        );

        sessionStorage.setItem(
          "mentorship-meeting-preferences",
          JSON.stringify({
            ...current,
            micEnabled: localMicOn,
            micId: deviceId,
          }),
        );
      } catch (error) {
        toast.error("Failed to change microphone");

        console.error("[CHANGE_MIC_ERROR]", error);
      }
    },
    [changeMic, audioDevices, localMicOn],
  );

  const handleChangeWebcam = useCallback(
    (deviceId: string) => {
      try {
        changeWebcam(deviceId);

        const device = videoDevices.find(
          (device) => device.deviceId === deviceId,
        );

        toast.success(`Camera changed to ${device?.label ?? "Unknown Camera"}`);

        const current = JSON.parse(
          sessionStorage.getItem("mentorship-meeting-preferences") ?? "{}",
        );

        sessionStorage.setItem(
          "mentorship-meeting-preferences",
          JSON.stringify({
            ...current,
            webcamEnabled: localWebcamOn,
            webcamId: deviceId,
          }),
        );
      } catch (error) {
        toast.error("Failed to change camera");

        console.error("[CHANGE_CAMERA_ERROR]", error);
      }
    },
    [changeWebcam, videoDevices, localWebcamOn],
  );

  const handleToggleScreenShare = useCallback(() => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.mediaDevices?.getDisplayMedia
    ) {
      toast.error("Screen sharing is not supported on this browser");

      return;
    }

    toggleScreenShare();
  }, [toggleScreenShare]);

  const handleRaiseHand = useCallback(async () => {
    if (!localParticipant) return;

    if (hasRaisedHand) {
      await publishRaiseHand(
        JSON.stringify({
          type: "HAND_LOWERED",
          participantId: localParticipant.id,
          participantName: localParticipant.displayName,
        }),
        {
          persist: true,
        },
      );

      return;
    }

    await publishRaiseHand(
      JSON.stringify({
        type: "HAND_RAISED",
        participantId: localParticipant.id,
        participantName: localParticipant.displayName,
        raisedAt: Date.now(),
      }),
      {
        persist: true,
      },
    );
  }, [localParticipant, hasRaisedHand, publishRaiseHand]);

  return (
    <div className="flex h-(--h-viewport-minus-navbar) flex-col overflow-hidden bg-muted-soft">
      {/* Header */}
      <MeetingHeader
        sessionTitle={sessionTitle}
        participantCount={participantIds.length}
        isWaitingForOthers={isWaitingForOthers}
        isSessionOwner={isSessionOwner}
        isEndingMeeting={isEndingMeeting}
        endsAt={endsAt}
        connectionQuality={localParticipantQuality.quality}
        onCountdownExpire={isSessionOwner ? handleCountdownExpire : undefined}
        onMobileCountdownExpire={() => {
          if (!isSessionOwner) {
            return;
          }

          void performMeetingEnd();
        }}
        onEndMeeting={handleManualEndMeeting}
      />
      {/* Main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted-soft p-3 sm:p-4 xl:p-5">
          {/* Joining Overlay */}
          {isConnecting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted-soft backdrop-blur-sm">
              <div className="mx-6 w-full max-w-sm rounded-3xl border bg-card/95 p-8 text-center shadow-xl">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>

                <h2 className="mt-5 text-xl font-semibold tracking-tight">
                  Joining Session
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Connecting you to the mentorship room...
                </p>
              </div>
            </div>
          )}

          {/* Outer Wrapper */}
          <div
            className={cn(
              "flex w-full justify-center",
              participantIds.length <= 4
                ? "min-h-full items-center"
                : "items-start",
            )}
          >
            {/* Grid */}
            <div
              className={cn(
                "grid w-full gap-3 auto-rows-max max-w-450",
                participantIds.length === 1 && "max-w-xl",
                participantIds.length === 2 && "grid-cols-1 md:grid-cols-2",
                participantIds.length <= 4 &&
                  participantIds.length > 2 &&
                  "grid-cols-2",
                participantIds.length <= 9 &&
                  participantIds.length > 4 &&
                  "grid-cols-2 md:grid-cols-3",
                participantIds.length > 9 &&
                  "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {participantIds.map((participantId) => (
                <MentorshipParticipantTile
                  key={participantId}
                  participantId={participantId}
                  isModerator={isModerator}
                  totalParticipants={participantIds.length}
                  localParticipantQuality={
                    participantId === localParticipant?.id
                      ? localParticipantQuality
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Chat */}
        <div className="hidden min-h-0 w-90 flex-col border-l bg-muted-soft xl:flex">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold tracking-tight">Chat</h2>
          </div>

          <MentorshipMeetingChat />
        </div>
      </div>

      {/* Bottom Controls */}
      <MeetingControls
        isModerator={isModerator}
        isSessionOwner={isSessionOwner}
        localMicOn={localMicOn}
        localWebcamOn={localWebcamOn}
        localScreenShareOn={localScreenShareOn}
        hasRaisedHand={hasRaisedHand}
        audioDevices={audioDevices}
        videoDevices={videoDevices}
        onToggleMic={toggleMic}
        onToggleWebcam={handleToggleWebcam}
        onToggleScreenShare={handleToggleScreenShare}
        onChangeMic={handleChangeMic}
        onChangeWebcam={handleChangeWebcam}
        onRaiseHand={handleRaiseHand}
        onLeaveMeeting={handleLeaveMeeting}
      />
    </div>
  );
}
