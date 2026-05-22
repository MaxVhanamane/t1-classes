"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { usePubSub } from "@videosdk.live/react-sdk";
import { useMeeting } from "@videosdk.live/react-sdk";
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
  MonitorUp,
  VideoOff,
  Hand,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";

import { MessageSquare } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

import { callServerAction } from "@/src/lib/actions/call-server-action";

import { endMentorshipSession } from "../../../actions/end-mentorship-session";

import { MentorshipParticipantTile } from "./mentorship-participant-tile";
import { MeetingCountdown } from "./meeting-countdown";
import { MentorshipMeetingChat } from "./mentorship-meeting-chat";
import { MeetingConnectionBadge } from "./meeting-connection-badge";
import { useParticipantQuality } from "../../../hoooks/use-participant-quality";

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
}

export function MentorshipMeetingView({
  isModerator,
  leaveRedirectHref,
  sessionId,
  endsAt,
  isSessionOwner,
}: MentorshipMeetingViewProps) {
  const router = useRouter();

  const [hasJoined, setHasJoined] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  // const [dataSaverMode, setDataSaverMode] = useState(false);
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

    const response = await callServerAction(
      endMentorshipSession({
        sessionId,
      }),
    );

    if (response.error) {
      isEndingMeetingRef.current = false;

      setIsEndingMeeting(false);

      toast.error(response.error || "Failed to end meeting");

      return false;
    }
    setMeetingExitReason("meeting_ended");
    setIsEndingMeeting(false);
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
      if (preferences.micEnabled && preferences.micId) {
        changeMic(preferences.micId);
      }

      /*
      Apply selected webcam
    */
      if (preferences.webcamEnabled && preferences.webcamId) {
        changeWebcam(preferences.webcamId);
      }
    } catch (error) {
      console.error("[APPLY_DEVICE_PREFERENCES_ERROR]", error);
    }
  }, [hasJoined, changeMic, changeWebcam]);

  const participantIds = useMemo(() => {
    const ids = Array.from(
      new Set([localParticipant?.id, ...Array.from(participants.keys())]),
    ).filter(Boolean) as string[];

    const getParticipantScore = (
      participant:
        | typeof localParticipant
        | ReturnType<typeof participants.get>
        | undefined,
    ) => {
      if (!participant) return 0;

      let value = 0;

      if (participant.screenShareOn) value += 100;

      if (participant.local) value += 50;

      if (participant.webcamOn) value += 10;

      return value;
    };

    return ids.sort((a, b) => {
      const participantA =
        a === localParticipant?.id ? localParticipant : participants.get(a);

      const participantB =
        b === localParticipant?.id ? localParticipant : participants.get(b);

      return (
        getParticipantScore(participantB) - getParticipantScore(participantA)
      );
    });
  }, [localParticipant, participants]);

  const isConnecting = !hasJoined && participantIds.length === 0;

  const isWaitingForOthers = hasJoined && participantIds.length <= 1;

  const hasRaisedHand = !!raisedHands[localParticipant?.id ?? ""];

  return (
    <div className="flex h-(--h-viewport-minus-navbar) flex-col overflow-hidden bg-muted-soft">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-muted-soft/95 backdrop-blur-xl">
        <div className="px-3 py-2 sm:px-4 lg:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Mobile + Desktop Left */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  Mentorship Session
                </h1>

                {isWaitingForOthers && (
                  <div className="rounded-full border border-amber-500/10 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium leading-none text-amber-200">
                    Waiting for others
                  </div>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                  <Users className="size-3" />

                  <span className="tabular-nums">
                    {participantIds.length} participant
                    {participantIds.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <MeetingConnectionBadge
                  quality={localParticipantQuality.quality}
                />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2 sm:flex">
              <MeetingCountdown
                endsAt={endsAt}
                onExpire={() => {
                  if (!isSessionOwner) {
                    return;
                  }

                  void performMeetingEnd();
                }}
              />

              {isSessionOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 rounded-full px-3 text-[11px] font-medium shadow-lg shadow-red-500/10"
                      disabled={isEndingMeeting}
                    >
                      {isEndingMeeting ? "Ending..." : "End Meeting"}
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="rounded-3xl border-white/10 bg-zinc-950">
                    <AlertDialogHeader>
                      <AlertDialogTitle>End Meeting?</AlertDialogTitle>

                      <AlertDialogDescription>
                        This will disconnect all participants and permanently
                        end the mentorship session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                        Cancel
                      </AlertDialogCancel>

                      <AlertDialogAction
                        className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleManualEndMeeting}
                      >
                        End Meeting
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Mobile Actions Row */}
            <div className="flex justify-end gap-2 sm:hidden">
              <MeetingCountdown
                endsAt={endsAt}
                onExpire={() => {
                  if (!isSessionOwner) {
                    return;
                  }

                  void performMeetingEnd();
                }}
              />

              {isSessionOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 rounded-full px-3 text-[11px] font-medium shadow-lg shadow-red-500/10"
                      disabled={isEndingMeeting}
                    >
                      {isEndingMeeting ? "Ending..." : "End Meeting"}
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="rounded-3xl border-white/10 bg-zinc-950">
                    <AlertDialogHeader>
                      <AlertDialogTitle>End Meeting?</AlertDialogTitle>

                      <AlertDialogDescription>
                        This will disconnect all participants and permanently
                        end the mentorship session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                        Cancel
                      </AlertDialogCancel>

                      <AlertDialogAction
                        className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleManualEndMeeting}
                      >
                        End Meeting
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted-soft p-3 sm:p-4 lg:p-5">
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
            className={`
      flex w-full justify-center
      ${participantIds.length <= 4 ? "min-h-full items-center" : "items-start"}
    `}
          >
            {/* Grid */}
            <div
              className={`
        grid w-full max-w-450 gap-3
        auto-rows-max
        ${
          participantIds.length === 1
            ? "max-w-6xl grid-cols-1"
            : participantIds.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : participantIds.length <= 4
                ? "grid-cols-2"
                : participantIds.length <= 9
                  ? "grid-cols-2 md:grid-cols-3"
                  : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        }
      `}
            >
              {[...participantIds].map((participantId, index) => (
                <MentorshipParticipantTile
                  key={`${participantId}-${index}`}
                  participantId={participantId}
                  isModerator={isModerator}
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
        <div className="hidden min-h-0 w-90 flex-col border-l bg-muted-soft lg:flex">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold tracking-tight">Chat</h2>
          </div>

          <MentorshipMeetingChat />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="sticky bottom-0 z-30 border-t bg-muted-soft/95 backdrop-blur supports-[padding:max(0px)]:pb-safe">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max items-center justify-center gap-2 px-3 py-3 sm:gap-4 sm:px-4">
            <Button
              variant={localMicOn ? "outline" : "secondary"}
              size="icon"
              className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
              onClick={() => toggleMic()}
            >
              {localMicOn ? (
                <Mic className="size-4 sm:size-5" />
              ) : (
                <MicOff className="size-4 sm:size-5" />
              )}
            </Button>

            <Button
              variant={localWebcamOn ? "outline" : "secondary"}
              size="icon"
              className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
              onClick={() => toggleWebcam()}
            >
              {localWebcamOn ? (
                <Video className="size-4 sm:size-5" />
              ) : (
                <VideoOff className="size-4 sm:size-5" />
              )}
            </Button>

            <Button
              variant={localScreenShareOn ? "default" : "outline"}
              size="icon"
              className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
              onClick={() => toggleScreenShare()}
            >
              <MonitorUp className="size-4 sm:size-5" />
            </Button>

            <Button
              variant={hasRaisedHand ? "default" : "outline"}
              size="icon"
              className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
              onClick={async () => {
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
              }}
            >
              <Hand className="size-4 sm:size-5" />
            </Button>

            {/* <Button
              variant={dataSaverMode ? "default" : "outline"}
              size="icon"
              className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
              onClick={() => setDataSaverMode((prev) => !prev)}
            >
              <WifiLow className="size-4 sm:size-5" />
            </Button> */}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14 lg:hidden"
                >
                  <MessageSquare className="size-4 sm:size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="
    top-4
    flex
    h-[80dvh]
    w-[90vw]
    flex-col
    rounded-l-3xl
    border-l
    p-0
    shadow-2xl
    sm:max-w-md
  "
              >
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle>Chat</SheetTitle>
                </SheetHeader>

                <div className="min-h-0 flex-1">
                  <MentorshipMeetingChat />
                </div>
              </SheetContent>
            </Sheet>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
                >
                  <PhoneOff className="size-4 sm:size-5" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isSessionOwner ? "End Session?" : "Leave Session?"}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {isSessionOwner
                      ? "Ending the session will disconnect all participants and permanently close the mentorship room."
                      : "You can rejoin later if the meeting is still active."}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleLeaveMeeting}
                  >
                    {isSessionOwner ? "End Session" : "Leave Session"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
