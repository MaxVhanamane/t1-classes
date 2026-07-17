"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { usePubSub } from "@videosdk.live/react-sdk";
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
import { MeetingPreferences } from "./mentorship-live-room";

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
  preferences: MeetingPreferences;
}

export function MentorshipMeetingView({
  isModerator,
  leaveRedirectHref,
  sessionId,
  endsAt,
  isSessionOwner,
  sessionTitle,
  preferences,
}: MentorshipMeetingViewProps) {
  const router = useRouter();

  const [hasJoined, setHasJoined] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);

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
  const [selectedMicId, setSelectedMicId] = useState(() => preferences.micId);
  const [selectedWebcamId, setSelectedWebcamId] = useState(
    () => preferences.webcamId,
  );
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

  // const handleToggleWebcam = async () => {
  //   if (localWebcamOn) {
  //     toggleWebcam(); // turning off, no track needed
  //     return;
  //   }

  //   // turning on — always create a fresh track, never reuse
  //   try {
  //     const freshTrack = await createCameraVideoTrack({
  //       encoderConfig: "h540p_w720p",
  //       optimizationMode: "motion",
  //       multiStream: false,
  //       bitrateMode: "high_quality",
  //     });

  //     toggleWebcam(freshTrack);
  //   } catch (error) {
  //     console.error("[TOGGLE_WEBCAM_ERROR]", error);
  //     toast.error("Failed to start camera");
  //   }
  // };

  const handleToggleWebcam = () => {
    try {
      toggleWebcam();
    } catch (error) {
      console.error("[TOGGLE_WEBCAM_ERROR]", error);
      toast.error("Failed to toggle camera");
    }
  };

  const handleToggleMic = useCallback(() => {
    toggleMic();
  }, [toggleMic]);

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
    if (isEndingMeetingRef.current) {
      return false;
    }

    isEndingMeetingRef.current = true;
    setIsEndingMeeting(true);

    const slowRequestTimer = setTimeout(() => {
      toast.info(
        "Ending the meeting is taking longer than usual. Please keep this page open.",
      );
    }, 10000);

    try {
      const response = await callServerAction(
        endMentorshipSession({ sessionId }),
      );

      if (response.error) {
        toast.error(response.error);
        return false;
      }

      setMeetingExitReason("meeting_ended");

      await publishMeetingEnded(
        JSON.stringify({
          type: "MEETING_ENDED",
        }),
        {
          persist: false,
        },
      );

      end();

      return true;
    } catch {
      toast.error("Something went wrong while ending the meeting.");

      return false;
    } finally {
      clearTimeout(slowRequestTimer);
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
    const timeout = setTimeout(() => {
      if (joinedRef.current) return;

      joinedRef.current = true;
      join();
    }, 500);

    return () => clearTimeout(timeout);
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
      const previousMicId = selectedMicId;

      /*
      Only revert if the SDK
      itself throws while
      changing the microphone.
    */
      try {
        changeMic(deviceId);
      } catch {
        setSelectedMicId(previousMicId);

        toast.error("Failed to change microphone");

        return;
      }

      // SDK accepted the change.
      setSelectedMicId(deviceId);

      const device = audioDevices.find(
        (device) => device.deviceId === deviceId,
      );

      toast.success(
        `Microphone changed to ${device?.label ?? "Unknown Microphone"}`,
      );

      /*
      Persist preference.
      Failure here should NOT
      revert the UI because
      the microphone has already
      changed successfully.
    */
      try {
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
      } catch {}
    },
    [changeMic, audioDevices, localMicOn, selectedMicId],
  );

  const handleChangeWebcam = useCallback(
    (deviceId: string) => {
      const previousWebcamId = selectedWebcamId;

      /*
      Only revert if the SDK
      itself throws while
      changing the camera.
    */
      try {
        changeWebcam(deviceId);
      } catch {
        setSelectedWebcamId(previousWebcamId);

        toast.error("Failed to change camera");

        return;
      }

      // SDK accepted the change.
      setSelectedWebcamId(deviceId);

      const device = videoDevices.find(
        (device) => device.deviceId === deviceId,
      );

      toast.success(`Camera changed to ${device?.label ?? "Unknown Camera"}`);

      /*
      Persist preference.
      Failure here should NOT
      revert the UI because
      the camera has already
      changed successfully.
    */
      try {
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
      } catch {
        // Ignore persistence failures.
      }
    },
    [changeWebcam, videoDevices, localWebcamOn, selectedWebcamId],
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
                "grid w-full gap-3 auto-rows-max max-w-450 grid-cols-1", // grid-cols-1 makes it always 1 column on mobile
                participantIds.length === 1 && "max-w-xl",
                participantIds.length > 1 &&
                  participantIds.length <= 4 &&
                  "md:grid-cols-2",
                participantIds.length > 4 &&
                  participantIds.length <= 9 &&
                  "md:grid-cols-3",
                participantIds.length > 9 && "md:grid-cols-3 xl:grid-cols-4",
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
        onToggleMic={handleToggleMic}
        onToggleWebcam={handleToggleWebcam}
        onToggleScreenShare={handleToggleScreenShare}
        onChangeMic={handleChangeMic}
        onChangeWebcam={handleChangeWebcam}
        onRaiseHand={handleRaiseHand}
        onLeaveMeeting={handleLeaveMeeting}
        selectedMicId={selectedMicId}
        selectedWebcamId={selectedWebcamId}
      />
    </div>
  );
}
