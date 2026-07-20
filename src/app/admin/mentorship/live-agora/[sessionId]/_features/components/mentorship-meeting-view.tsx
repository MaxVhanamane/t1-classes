"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, {
  useRTCClient,
  useConnectionState,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useLocalScreenTrack,
  usePublish,
  useRemoteUsers,
  useCurrentUID,
  useRemoteAudioTracks,
  useRemoteVideoTracks,
} from "agora-rtc-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { callServerAction } from "@/src/lib/actions/call-server-action";
import { endMentorshipSession } from "../actions/end-mentorship-session";

import { AgoraParticipantTile } from "./agora-participant-tile";
// LIFTED STATE: Import the ChatMessage type here
import { AgoraMeetingChat, ChatMessage } from "./agora-meeting-chat";
import { cn } from "@/src/lib/utils";
import { MeetingHeader } from "./meeting-header";
import { MeetingControls } from "./meeting-controls";
import { LiveSessionProps } from "./live-room-client";

interface AgoraMessagingClient {
  sendStreamMessage(msg: Uint8Array): Promise<void>;
}

type RemoteUserType = ReturnType<typeof useRemoteUsers>[number];

interface ParticipantData {
  uid: string;
  isLocal: boolean;
  user: RemoteUserType | null;
}

interface MentorshipMeetingViewProps extends LiveSessionProps {
  leaveRedirectHref: string;
}

export function MentorshipMeetingView({
  isModerator,
  leaveRedirectHref,
  sessionId,
  endsAt,
  isSessionOwner,
  sessionTitle,
  sessionDescription,
  participantName,
}: MentorshipMeetingViewProps) {
  const router = useRouter();
  const client = useRTCClient();
  const connectionState = useConnectionState();
  const currentUid = useCurrentUID();
  const remoteUsers = useRemoteUsers();

  // LIFTED STATE: Chat messages now live at the top-level parent view
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  // FIX 1: Extract audioTracks and videoTracks properly
  const { audioTracks, error: audioSubError } =
    useRemoteAudioTracks(remoteUsers);
  const { videoTracks, error: videoSubError } =
    useRemoteVideoTracks(remoteUsers);

  useEffect(() => {
    if (audioSubError) {
      console.error("[AUDIO_SUBSCRIBE_ERROR]", audioSubError);
      toast.error("Audio subscribe failed", {
        description: audioSubError.message,
      });
    }
  }, [audioSubError]);

  useEffect(() => {
    if (videoSubError) {
      console.error("[VIDEO_SUBSCRIBE_ERROR]", videoSubError);
      toast.error("Video subscribe failed", {
        description: videoSubError.message,
      });
    }
  }, [videoSubError]);
  // Mute Locks
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

  const [micEnabled, setMicEnabled] = useState<boolean>(() => {
    try {
      if (sessionStorage.getItem(`mute-lock-${sessionId}`) === "true") {
        return false;
      }
      const stored = sessionStorage.getItem("mentorship-meeting-preferences");
      return stored ? (JSON.parse(stored).micEnabled ?? true) : true;
    } catch {
      return true;
    }
  });

  const [webcamEnabled, setWebcamEnabled] = useState<boolean>(() => {
    try {
      if (sessionStorage.getItem(`video-lock-${sessionId}`) === "true") {
        return false;
      }
      const stored = sessionStorage.getItem("mentorship-meeting-preferences");
      return stored ? (JSON.parse(stored).webcamEnabled ?? true) : true;
    } catch {
      return true;
    }
  });

  const [selectedMicId, setSelectedMicId] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem("mentorship-meeting-preferences");
      return stored ? JSON.parse(stored).micId || "" : "";
    } catch {
      return "";
    }
  });

  const [selectedWebcamId, setSelectedWebcamId] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem("mentorship-meeting-preferences");
      return stored ? JSON.parse(stored).webcamId || "" : "";
    } catch {
      return "";
    }
  });

  const initialMicIdRef = useRef(selectedMicId);
  const initialWebcamIdRef = useRef(selectedWebcamId);

  // Tracks whether the mic hardware should be engaged AT ALL this session.
  const [micTrackNeeded, setMicTrackNeeded] = useState<boolean>(
    () => micEnabled,
  );

  useEffect(() => {
    if (micEnabled && !micTrackNeeded) {
      setMicTrackNeeded(true);
    }
  }, [micEnabled, micTrackNeeded]);

  const [camTrackNeeded, setCamTrackNeeded] = useState<boolean>(
    () => webcamEnabled,
  );

  useEffect(() => {
    if (webcamEnabled && !camTrackNeeded) {
      setCamTrackNeeded(true);
    }
  }, [webcamEnabled, camTrackNeeded]);

  const [screenShareOn, setScreenShareOn] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [remoteMediaStates, setRemoteMediaStates] = useState<
    Record<
      string,
      { micOn: boolean; cameraOn: boolean; screenShareOn: boolean }
    >
  >({});
  const [raisedHands, setRaisedHands] = useState<
    Record<string, { name: string; time: number }>
  >({});

  const micConfig = useMemo(
    () => ({ microphoneId: initialMicIdRef.current || undefined }),
    [],
  );
  const camConfig = useMemo(
    () => ({ cameraId: initialWebcamIdRef.current || undefined }),
    [],
  );

  const {
    localMicrophoneTrack,
    error: isMicrophoneTrackError,
    isLoading: isMicrophoneTrackLoading,
  } = useLocalMicrophoneTrack(micTrackNeeded, micConfig);
  const {
    localCameraTrack,
    error: isCameraTrackError,
    isLoading: isCameraTrackLoading,
  } = useLocalCameraTrack(camTrackNeeded, camConfig);

  const {
    screenTrack: localScreenTrack,
    error: isScreenTrackError,
    isLoading: isScreenTrackLoading,
  } = useLocalScreenTrack(screenShareOn, {}, "disable");

  const releaseHardware = useCallback(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.stop();
      localMicrophoneTrack.close();
    }
    if (localCameraTrack) {
      localCameraTrack.stop();
      localCameraTrack.close();
    }
    if (localScreenTrack) {
      localScreenTrack.stop();
      localScreenTrack.close();
    }
  }, [localMicrophoneTrack, localCameraTrack, localScreenTrack]);

  const releaseHardwareRef = useRef(releaseHardware);
  useEffect(() => {
    releaseHardwareRef.current = releaseHardware;
  }, [releaseHardware]);

  useEffect(() => {
    return () => {
      releaseHardwareRef.current();
    };
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      releaseHardwareRef.current();
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  useEffect(() => {
    if (!localMicrophoneTrack) return;
    const shouldBeMuted = !micEnabled;
    if (localMicrophoneTrack.muted === shouldBeMuted) return;
    localMicrophoneTrack.setMuted(shouldBeMuted).catch((err) => {
      console.error("[MIC_SET_MUTED_ERROR]", err);
    });
  }, [localMicrophoneTrack, micEnabled]);

  useEffect(() => {
    if (!localCameraTrack) return;
    const shouldBeEnabled = webcamEnabled;
    if (localCameraTrack.enabled === shouldBeEnabled) return;
    localCameraTrack.setEnabled(shouldBeEnabled).catch((err) => {
      console.error("[CAMERA_SET_ENABLED_ERROR]", err);
    });
  }, [localCameraTrack, webcamEnabled]);

  /* --- ERROR & PERMISSION HANDLING --- */
  useEffect(() => {
    if (isMicrophoneTrackError) {
      setMicEnabled(false);
      setMicTrackNeeded(false);
      toast.error("Failed to access microphone. Please check permissions.");
    }
  }, [isMicrophoneTrackError]);

  useEffect(() => {
    if (isCameraTrackError) {
      setWebcamEnabled(false);
      setCamTrackNeeded(false);
      toast.error("Failed to access camera. Please check permissions.");
    }
  }, [isCameraTrackError]);

  useEffect(() => {
    if (isScreenTrackError) {
      setScreenShareOn(false);

      const errorMsg = String(isScreenTrackError.rtcError);
      const isDenied =
        isScreenTrackError.name === "NotAllowedError" ||
        errorMsg.includes("NotAllowedError") ||
        errorMsg.includes("Permission denied") ||
        errorMsg.includes("PERMISSION_DENIED");

      if (isDenied) {
        toast.info("Screen sharing canceled.");
      } else {
        toast.error(
          "Failed to share screen. Please check browser permissions.",
        );
        console.error("[SCREEN_SHARE_ERROR]", isScreenTrackError);
      }
    }
  }, [isScreenTrackError]);

  useEffect(() => {
    if (!localScreenTrack) return;
    const handleTrackEnded = () => {
      setScreenShareOn(false);
      toast.info("Screen sharing ended.");
    };
    localScreenTrack.on("track-ended", handleTrackEnded);
    return () => {
      localScreenTrack.off("track-ended", handleTrackEnded);
    };
  }, [localScreenTrack]);
  /* ----------------------------------- */

  const tracksToPublish = useMemo(() => {
    const tracks = [];
    if (localMicrophoneTrack) tracks.push(localMicrophoneTrack);
    if (screenShareOn && localScreenTrack) {
      tracks.push(localScreenTrack);
    } else if (localCameraTrack) {
      tracks.push(localCameraTrack);
    }
    return tracks;
  }, [localMicrophoneTrack, screenShareOn, localScreenTrack, localCameraTrack]);

  usePublish(tracksToPublish);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const cameras = await AgoraRTC.getCameras();
        const mics = await AgoraRTC.getMicrophones();
        setVideoDevices(cameras);
        setAudioDevices(mics);
      } catch (error) {
        console.error("[AGORA_DEVICES]", error);
      }
    };
    void fetchDevices();
    navigator.mediaDevices?.addEventListener("devicechange", fetchDevices);
    return () =>
      navigator.mediaDevices?.removeEventListener("devicechange", fetchDevices);
  }, []);

  const broadcastPayloadSafely = useCallback(
    async (payload: object) => {
      if (client.connectionState !== "CONNECTED") return;
      try {
        const messagingClient = client as unknown as AgoraMessagingClient;
        await messagingClient.sendStreamMessage(
          new TextEncoder().encode(JSON.stringify(payload)),
        );
      } catch (error) {
        console.warn("Message broadcast failed", error);
      }
    },
    [client],
  );

  const broadcastMyState = useCallback(() => {
    if (!currentUid) return;
    void broadcastPayloadSafely({
      type: "USER_STATE",
      uid: currentUid.toString(),
      name: participantName,
      micOn: micEnabled,
      cameraOn: webcamEnabled || screenShareOn,
      screenShareOn: screenShareOn,
    });
  }, [
    currentUid,
    participantName,
    micEnabled,
    webcamEnabled,
    screenShareOn,
    broadcastPayloadSafely,
  ]);

  useEffect(() => {
    if (connectionState === "CONNECTED") void broadcastMyState();
  }, [
    micEnabled,
    webcamEnabled,
    screenShareOn,
    connectionState,
    broadcastMyState,
  ]);

  useEffect(() => {
    const handleUserJoined = () => setTimeout(() => broadcastMyState(), 1000);
    client.on("user-joined", handleUserJoined);
    return () => {
      client.off("user-joined", handleUserJoined);
    };
  }, [client, broadcastMyState]);

  const handleDisconnect = useCallback(async () => {
    releaseHardware();
    try {
      await client.leave();
    } catch (err) {
      console.error("[AGORA_LEAVE_ERROR]", err);
    } finally {
      sessionStorage.removeItem(`mute-lock-${sessionId}`);
      sessionStorage.removeItem(`video-lock-${sessionId}`);
      router.replace(leaveRedirectHref);
    }
  }, [client, router, leaveRedirectHref, sessionId, releaseHardware]);

  // Remote Actions
  const handleForceMuteRemote = useCallback(
    (targetUid: string) => {
      void broadcastPayloadSafely({ type: "FORCE_MUTE", targetUid });
    },
    [broadcastPayloadSafely],
  );

  const handleLiftMuteLockRemote = useCallback(
    (targetUid: string) => {
      void broadcastPayloadSafely({ type: "LIFT_MUTE_LOCK", targetUid });
    },
    [broadcastPayloadSafely],
  );

  const handleForceVideoMuteRemote = useCallback(
    (targetUid: string) => {
      void broadcastPayloadSafely({ type: "FORCE_VIDEO_MUTE", targetUid });
    },
    [broadcastPayloadSafely],
  );

  const handleLiftVideoLockRemote = useCallback(
    (targetUid: string) => {
      void broadcastPayloadSafely({ type: "LIFT_VIDEO_LOCK", targetUid });
    },
    [broadcastPayloadSafely],
  );

  const handleKickRemote = useCallback(
    (targetUid: string) => {
      void broadcastPayloadSafely({ type: "KICK_USER", targetUid });
    },
    [broadcastPayloadSafely],
  );

  useEffect(() => {
    const handleStreamMessage = (uid: number | string, payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        const senderUid = data.uid || uid.toString();

        if (data.type === "USER_STATE") {
          if (data.name)
            setUserNames((prev) => ({ ...prev, [senderUid]: data.name }));
          setRemoteMediaStates((prev) => ({
            ...prev,
            [senderUid]: {
              micOn: data.micOn,
              cameraOn: data.cameraOn,
              screenShareOn: data.screenShareOn || false,
            },
          }));
        } else if (data.type === "CHAT_MESSAGE") {
          // LIFTED STATE: Intercept chat packets globally to preserve them in the parent's memory
          setLiveMessages((prev) => [
            ...prev,
            {
              id: data.id,
              senderId: senderUid,
              senderName: data.senderName,
              message: data.message,
              timestamp: data.timestamp,
              status: "sent",
            },
          ]);
        } else if (
          data.type === "FORCE_MUTE" &&
          data.targetUid === currentUid?.toString()
        ) {
          setHostMuteLock(true);
          setMicEnabled(false);
          sessionStorage.setItem(`mute-lock-${sessionId}`, "true");
          toast.error("The host has muted your microphone.");
        } else if (
          data.type === "LIFT_MUTE_LOCK" &&
          data.targetUid === currentUid?.toString()
        ) {
          setHostMuteLock(false);
          sessionStorage.setItem(`mute-lock-${sessionId}`, "false");
          toast.success("The host has allowed you to unmute your microphone.");
        } else if (
          data.type === "FORCE_VIDEO_MUTE" &&
          data.targetUid === currentUid?.toString()
        ) {
          setHostVideoLock(true);
          setWebcamEnabled(false);
          sessionStorage.setItem(`video-lock-${sessionId}`, "true");
          toast.error("The host has disabled your camera.");
        } else if (
          data.type === "LIFT_VIDEO_LOCK" &&
          data.targetUid === currentUid?.toString()
        ) {
          setHostVideoLock(false);
          sessionStorage.setItem(`video-lock-${sessionId}`, "false");
          toast.success("The host has allowed you to enable your camera.");
        } else if (
          data.type === "KICK_USER" &&
          data.targetUid === currentUid?.toString()
        ) {
          toast.error("You have been removed from the session by the host.");
          void handleDisconnect();
        } else if (data.type === "HAND_RAISED") {
          setRaisedHands((prev) => ({
            ...prev,
            [data.uid]: { name: data.name, time: data.time },
          }));
          toast.info(`${data.name} raised their hand ✋`);
        } else if (data.type === "HAND_LOWERED") {
          setRaisedHands((prev) => {
            const next = { ...prev };
            delete next[data.uid];
            return next;
          });
        } else if (data.type === "MEETING_ENDED") {
          toast.info("The host has ended the session.");
          void handleDisconnect();
        }
      } catch (error) {
        console.error("[STREAM_MESSAGE_PARSE_ERROR]", error);
      }
    };

    client.on("stream-message", handleStreamMessage);
    return () => {
      client.off("stream-message", handleStreamMessage);
    };
  }, [client, currentUid, handleDisconnect, sessionId]);

  const performMeetingEnd = useCallback(async () => {
    setIsEndingMeeting(true);
    releaseHardware();
    try {
      try {
        await broadcastPayloadSafely({ type: "MEETING_ENDED" });
      } catch (broadcastErr) {}
      try {
        await client.leave();
      } catch (leaveErr) {}
      await callServerAction(endMentorshipSession({ sessionId }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update session status in DB.";
      toast.error(errorMessage);
    } finally {
      setIsEndingMeeting(false);
      sessionStorage.removeItem(`mute-lock-${sessionId}`);
      sessionStorage.removeItem(`video-lock-${sessionId}`);
      router.replace(leaveRedirectHref);
    }
  }, [
    sessionId,
    client,
    router,
    leaveRedirectHref,
    broadcastPayloadSafely,
    releaseHardware,
  ]);

  // 1. Define the cooldown duration (5 seconds)
  const lastHandActionTime = useRef(0);
  const HAND_COOLDOWN_MS = 5000;

  const handleRaiseHand = useCallback(async () => {
    if (!currentUid) return;

    // 2. Prevent spam with a 5-second time check
    const now = Date.now();
    if (now - lastHandActionTime.current < HAND_COOLDOWN_MS) {
      toast.warning("Please wait a few seconds before toggling your hand.");
      return;
    }
    lastHandActionTime.current = now;

    const uidStr = currentUid.toString();
    const isRaised = !!raisedHands[uidStr];

    const payload = {
      type: isRaised ? "HAND_LOWERED" : "HAND_RAISED",
      uid: uidStr,
      name: participantName,
      time: Date.now(),
    };

    try {
      // 3. Use void for fire-and-forget
      void broadcastPayloadSafely(payload);

      setRaisedHands((prev) => {
        const next = { ...prev };
        if (isRaised) delete next[uidStr];
        else next[uidStr] = { name: participantName, time: Date.now() };
        return next;
      });
    } catch {
      toast.error("Failed to send action");
    }
  }, [currentUid, raisedHands, participantName, broadcastPayloadSafely]);

  const participantList = useMemo<ParticipantData[]>(() => {
    const list: ParticipantData[] = [];
    if (currentUid) {
      list.push({ uid: currentUid.toString(), isLocal: true, user: null });
    }
    remoteUsers.forEach((u) => {
      list.push({ uid: u.uid.toString(), isLocal: false, user: u });
    });

    return list.sort((a, b) =>
      a.isLocal === b.isLocal ? 0 : a.isLocal ? -1 : 1,
    );
  }, [currentUid, remoteUsers]);

  const isConnecting = connectionState === "CONNECTING";
  const isWaitingForOthers =
    connectionState === "CONNECTED" && remoteUsers.length === 0;

  return (
    <div className="flex h-(--h-viewport-minus-navbar) flex-col overflow-hidden">
      {/* Header */}
      <MeetingHeader
        sessionTitle={sessionTitle}
        sessionDescription={sessionDescription}
        participantCount={participantList.length}
        isWaitingForOthers={isWaitingForOthers}
        isSessionOwner={isSessionOwner}
        isEndingMeeting={isEndingMeeting}
        endsAt={endsAt}
        onCountdownExpire={
          isSessionOwner ? () => void performMeetingEnd() : undefined
        }
        onEndMeeting={() => void performMeetingEnd()}
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
              participantList.length <= 4
                ? "min-h-full items-center"
                : "items-start",
            )}
          >
            {/* Grid */}
            <div
              className={cn(
                "grid w-full gap-3 auto-rows-max max-w-450 grid-cols-1",
                participantList.length === 1 && "max-w-xl",
                participantList.length > 1 &&
                  participantList.length <= 4 &&
                  "md:grid-cols-2",
                participantList.length > 4 &&
                  participantList.length <= 9 &&
                  "md:grid-cols-3",
                participantList.length > 9 && "md:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {participantList.map(({ uid, isLocal, user }) => {
                const remoteState = remoteMediaStates[uid] || {
                  micOn: user?.hasAudio,
                  cameraOn: user?.hasVideo,
                  screenShareOn: false,
                };
                const aTrack = user
                  ? audioTracks.find(
                      (t) => String(t.getUserId()) === String(user.uid),
                    )
                  : null;
                const vTrack = user
                  ? videoTracks.find(
                      (t) => String(t.getUserId()) === String(user.uid),
                    )
                  : null;
                return (
                  <AgoraParticipantTile
                    key={uid}
                    uid={uid}
                    isLocal={isLocal}
                    remoteVideoTrack={vTrack}
                    remoteAudioTrack={aTrack}
                    localVideoTrack={
                      isLocal
                        ? screenShareOn
                          ? (localScreenTrack ?? undefined)
                          : (localCameraTrack ?? undefined)
                        : undefined
                    }
                    isModerator={isModerator}
                    displayName={
                      isLocal
                        ? participantName
                        : userNames[uid] || "Participant"
                    }
                    micOn={isLocal ? micEnabled : remoteState.micOn}
                    cameraOn={
                      isLocal
                        ? webcamEnabled || screenShareOn
                        : remoteState.cameraOn
                    }
                    isScreenSharing={
                      isLocal ? screenShareOn : remoteState.screenShareOn
                    }
                    isLoadingVideo={
                      isLocal
                        ? screenShareOn
                          ? isScreenTrackLoading
                          : isCameraTrackLoading
                        : false
                    }
                    onForceMute={handleForceMuteRemote}
                    onLiftMuteLock={handleLiftMuteLockRemote}
                    onForceVideoMute={handleForceVideoMuteRemote}
                    onLiftVideoLock={handleLiftVideoLockRemote}
                    onKickUser={handleKickRemote}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Chat */}
        <div className="hidden min-h-0 w-90 flex-col border-l xl:flex">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold tracking-tight">Chat</h2>
          </div>
          <AgoraMeetingChat
            participantName={participantName}
            localUid={currentUid?.toString() || ""}
            client={client}
            // LIFTED STATE: Provide state down to component
            liveMessages={liveMessages}
            setLiveMessages={setLiveMessages}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <MeetingControls
        participantName={participantName}
        localUid={currentUid?.toString() || ""}
        client={client}
        isModerator={isModerator}
        isSessionOwner={isSessionOwner}
        localMicOn={micEnabled}
        localWebcamOn={webcamEnabled}
        localScreenShareOn={screenShareOn}
        hasRaisedHand={!!raisedHands[currentUid?.toString() || ""]}
        audioDevices={audioDevices}
        videoDevices={videoDevices}
        selectedMicId={selectedMicId}
        selectedWebcamId={selectedWebcamId}
        // LIFTED STATE: Provide state down to controls for passing to the mobile sheet
        liveMessages={liveMessages}
        setLiveMessages={setLiveMessages}
        onToggleMic={() => {
          if (hostMuteLock) {
            toast.error("You cannot unmute. The host has muted you.");
            return;
          }
          setMicEnabled(!micEnabled);
        }}
        onToggleWebcam={() => {
          if (hostVideoLock) {
            toast.error(
              "You cannot turn on the camera. The host has disabled it.",
            );
            return;
          }
          setWebcamEnabled(!webcamEnabled);
        }}
        onToggleScreenShare={() => setScreenShareOn(!screenShareOn)}
        onChangeMic={async (id: string) => {
          if (hostMuteLock) {
            toast.error(
              "You cannot change the microphone while forcefully muted.",
            );
            return;
          }

          try {
            if (localMicrophoneTrack) {
              await localMicrophoneTrack.setDevice(id);
            } else {
              initialMicIdRef.current = id;
            }
            setSelectedMicId(id);

            const device = audioDevices.find((d) => d.deviceId === id);
            toast.success(
              `Microphone changed to ${device?.label ?? "Unknown Microphone"}`,
            );

            const current = JSON.parse(
              sessionStorage.getItem("mentorship-meeting-preferences") ?? "{}",
            );
            sessionStorage.setItem(
              "mentorship-meeting-preferences",
              JSON.stringify({ ...current, micId: id }),
            );
          } catch (error) {
            console.error("Failed to change microphone", error);
            toast.error("Failed to change microphone");
          }
        }}
        onChangeWebcam={async (id: string) => {
          if (hostVideoLock) {
            toast.error(
              "You cannot change the camera while forcefully disabled.",
            );
            return;
          }

          try {
            if (localCameraTrack) {
              await localCameraTrack.setDevice(id);
            } else {
              initialWebcamIdRef.current = id;
            }
            setSelectedWebcamId(id);

            const device = videoDevices.find((d) => d.deviceId === id);
            toast.success(
              `Camera changed to ${device?.label ?? "Unknown Camera"}`,
            );

            const current = JSON.parse(
              sessionStorage.getItem("mentorship-meeting-preferences") ?? "{}",
            );
            sessionStorage.setItem(
              "mentorship-meeting-preferences",
              JSON.stringify({ ...current, webcamId: id }),
            );
          } catch (error) {
            console.error("Failed to change camera", error);
            toast.error("Failed to change camera");
          }
        }}
        onRaiseHand={() => void handleRaiseHand()}
        onLeaveMeeting={() =>
          void (isSessionOwner ? performMeetingEnd() : handleDisconnect())
        }
      />
    </div>
  );
}
