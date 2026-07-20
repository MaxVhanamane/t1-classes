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
  sessionDescription: string | null;
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
  sessionDescription,
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

  // Mute Locks (Stored in session just like Agora implementation)
  const [hostMuteLock, setHostMuteLock] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(`mute-lock-${sessionId}`) === "true";
    } catch {
      return false;
    }
  });

  const [hostVideoLock, setHostVideoLock] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(`video-lock-${sessionId}`) === "true";
    } catch {
      return false;
    }
  });

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
    muteMic,
    disableWebcam,
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

  const handleToggleWebcam = useCallback(() => {
    // PREVENT TOGGLE IF LOCKED
    if (hostVideoLock) {
      toast.error("You cannot turn on the camera. The host has disabled it.");
      return;
    }
    try {
      toggleWebcam();
    } catch (error) {
      console.error("[TOGGLE_WEBCAM_ERROR]", error);
      toast.error("Failed to toggle camera");
    }
  }, [toggleWebcam, hostVideoLock]);

  const handleToggleMic = useCallback(() => {
    // PREVENT TOGGLE IF LOCKED
    if (hostMuteLock) {
      toast.error("You cannot unmute. The host has muted you.");
      return;
    }
    toggleMic();
  }, [toggleMic, hostMuteLock]);

  // PubSub for Remote Controls (Muting/Video Disabling)
  const { publish: publishMediaControl } = usePubSub("MEDIA_CONTROLS", {
    onMessageReceived(message) {
      try {
        const data = JSON.parse(message.message);

        // If the command is targeting THIS local user
        if (data.targetUid === localParticipant?.id) {
          if (data.type === "FORCE_MUTE") {
            setHostMuteLock(true);
            sessionStorage.setItem(`mute-lock-${sessionId}`, "true");
            muteMic();
            toast.error("The host has muted your microphone.");
          } else if (data.type === "LIFT_MUTE_LOCK") {
            setHostMuteLock(false);
            sessionStorage.setItem(`mute-lock-${sessionId}`, "false");
            toast.success(
              "The host has allowed you to unmute your microphone.",
            );
          } else if (data.type === "FORCE_VIDEO_MUTE") {
            setHostVideoLock(true);
            sessionStorage.setItem(`video-lock-${sessionId}`, "true");
            disableWebcam();
            toast.error("The host has disabled your camera.");
          } else if (data.type === "LIFT_VIDEO_LOCK") {
            setHostVideoLock(false);
            sessionStorage.setItem(`video-lock-${sessionId}`, "false");
            toast.success("The host has allowed you to enable your camera.");
          }
        }
      } catch (error) {
        console.error("[MEDIA_CONTROL_PARSE_ERROR]", error);
      }
    },
  });

  // Moderator Handlers
  const handleForceMuteRemote = useCallback(
    (targetUid: string) => {
      void publishMediaControl(
        JSON.stringify({ type: "FORCE_MUTE", targetUid }),
        { persist: true },
      );
    },
    [publishMediaControl],
  );

  const handleLiftMuteLockRemote = useCallback(
    (targetUid: string) => {
      void publishMediaControl(
        JSON.stringify({ type: "LIFT_MUTE_LOCK", targetUid }),
        { persist: true },
      );
    },
    [publishMediaControl],
  );

  const handleForceVideoMuteRemote = useCallback(
    (targetUid: string) => {
      void publishMediaControl(
        JSON.stringify({ type: "FORCE_VIDEO_MUTE", targetUid }),
        { persist: true },
      );
    },
    [publishMediaControl],
  );

  const handleLiftVideoLockRemote = useCallback(
    (targetUid: string) => {
      void publishMediaControl(
        JSON.stringify({ type: "LIFT_VIDEO_LOCK", targetUid }),
        { persist: true },
      );
    },
    [publishMediaControl],
  );

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

      // Clean up locks
      sessionStorage.removeItem(`mute-lock-${sessionId}`);
      sessionStorage.removeItem(`video-lock-${sessionId}`);
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

        sessionStorage.removeItem(`mute-lock-${sessionId}`);
        sessionStorage.removeItem(`video-lock-${sessionId}`);
        return;
      }

      setMeetingExitReason("manual_leave");

      sessionStorage.removeItem(`mute-lock-${sessionId}`);
      sessionStorage.removeItem(`video-lock-${sessionId}`);
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
      // PREVENT DEVICE CHANGE UNMUTE IF LOCKED
      if (hostMuteLock) {
        toast.error("You cannot change the microphone while forcefully muted.");
        return;
      }

      const previousMicId = selectedMicId;
      try {
        changeMic(deviceId);
      } catch {
        setSelectedMicId(previousMicId);
        toast.error("Failed to change microphone");
        return;
      }

      setSelectedMicId(deviceId);
      const device = audioDevices.find(
        (device) => device.deviceId === deviceId,
      );
      toast.success(
        `Microphone changed to ${device?.label ?? "Unknown Microphone"}`,
      );

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
    [changeMic, audioDevices, localMicOn, selectedMicId, hostMuteLock],
  );

  const handleChangeWebcam = useCallback(
    (deviceId: string) => {
      // PREVENT DEVICE CHANGE UNMUTE IF LOCKED
      if (hostVideoLock) {
        toast.error("You cannot change the camera while forcefully disabled.");
        return;
      }

      const previousWebcamId = selectedWebcamId;
      try {
        changeWebcam(deviceId);
      } catch {
        setSelectedWebcamId(previousWebcamId);
        toast.error("Failed to change camera");
        return;
      }

      setSelectedWebcamId(deviceId);
      const device = videoDevices.find(
        (device) => device.deviceId === deviceId,
      );
      toast.success(`Camera changed to ${device?.label ?? "Unknown Camera"}`);

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
    [
      changeWebcam,
      videoDevices,
      localWebcamOn,
      selectedWebcamId,
      hostVideoLock,
    ],
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

  // 1. Define the cooldown duration
  const lastHandActionTime = useRef(0);
  const HAND_COOLDOWN_MS = 5000;

  const handleRaiseHand = useCallback(async () => {
    if (!localParticipant) return;

    // 2. Prevent spam with a 5-second time check
    const now = Date.now();
    if (now - lastHandActionTime.current < HAND_COOLDOWN_MS) {
      toast.warning("Please wait a few seconds before toggling your hand.");
      return;
    }
    lastHandActionTime.current = now;

    if (hasRaisedHand) {
      void publishRaiseHand(
        JSON.stringify({
          type: "HAND_LOWERED",
          participantId: localParticipant.id,
          participantName: localParticipant.displayName,
        }),
        { persist: true },
      );
      return;
    }

    void publishRaiseHand(
      JSON.stringify({
        type: "HAND_RAISED",
        participantId: localParticipant.id,
        participantName: localParticipant.displayName,
        raisedAt: Date.now(),
      }),
      { persist: true },
    );
  }, [localParticipant, hasRaisedHand, publishRaiseHand]);

  return (
    <div className="flex h-(--h-viewport-minus-navbar) flex-col overflow-hidden">
      {/* Header */}
      <MeetingHeader
        sessionTitle={sessionTitle}
        sessionDescription={sessionDescription}
        participantCount={participantIds.length}
        isWaitingForOthers={isWaitingForOthers}
        isSessionOwner={isSessionOwner}
        isEndingMeeting={isEndingMeeting}
        endsAt={endsAt}
        onCountdownExpire={isSessionOwner ? handleCountdownExpire : undefined}
        onEndMeeting={handleManualEndMeeting}
      />
      {/* Main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 xl:p-5">
          {/* Joining Overlay */}
          {isConnecting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
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
                "grid w-full gap-3 auto-rows-max max-w-450 grid-cols-1",
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
                  onForceMute={handleForceMuteRemote}
                  onLiftMuteLock={handleLiftMuteLockRemote}
                  onForceVideoMute={handleForceVideoMuteRemote}
                  onLiftVideoLock={handleLiftVideoLockRemote}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Chat */}
        <div className="hidden min-h-0 w-90 flex-col border-l xl:flex">
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
