"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Hand,
  ChevronDown,
  MessageSquare,
  PhoneOff,
  Check,
} from "lucide-react";
import { useRTCClient } from "agora-rtc-react";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

// Import your actual chat component
import { AgoraMeetingChat } from "./agora-meeting-chat";

type RTCClientType = ReturnType<typeof useRTCClient>;

interface MeetingControlsProps {
  isModerator: boolean;
  isSessionOwner: boolean;
  localMicOn: boolean;
  localWebcamOn: boolean;
  localScreenShareOn: boolean;
  hasRaisedHand: boolean;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedMicId: string;
  selectedWebcamId: string;

  // New props needed for the mobile chat
  localUid: string;
  participantName: string;
  client: RTCClientType;

  onToggleMic: () => void;
  onToggleWebcam: () => void;
  onToggleScreenShare: () => void;
  onChangeMic: (id: string) => void;
  onChangeWebcam: (id: string) => void;
  onRaiseHand: () => void;
  onLeaveMeeting: () => void;
}

export function MeetingControls({
  isModerator,
  isSessionOwner,
  localMicOn,
  localWebcamOn,
  localScreenShareOn,
  hasRaisedHand,
  audioDevices,
  videoDevices,
  selectedMicId,
  selectedWebcamId,
  localUid,
  participantName,
  client,
  onToggleMic,
  onToggleWebcam,
  onToggleScreenShare,
  onChangeMic,
  onChangeWebcam,
  onRaiseHand,
  onLeaveMeeting,
}: MeetingControlsProps) {
  return (
    <div className="sticky bottom-0 z-30 border-t bg-muted-soft/95 backdrop-blur supports-[padding:max(0px)]:pb-safe">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max items-center justify-center gap-2 px-3 py-3 sm:gap-4 sm:px-4">
          {/* Mic */}
          <div className="flex items-center">
            <Button
              variant={localMicOn ? "outline" : "secondary"}
              size="icon"
              className="size-11 rounded-r-none border-r-0 shadow-sm transition active:scale-95 sm:size-14"
              onClick={onToggleMic}
            >
              {localMicOn ? (
                <Mic className="size-4 sm:size-5" />
              ) : (
                <MicOff className="size-4 sm:size-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-8 rounded-l-none border-l border-white/10 px-0 shadow-sm transition active:scale-95 sm:h-14 sm:w-10"
                >
                  <ChevronDown className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {audioDevices.map((d) => (
                  <DropdownMenuItem
                    key={d.deviceId}
                    onClick={() => onChangeMic(d.deviceId)}
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="truncate">
                        {d.label || "Unknown Microphone"}
                      </span>
                      {d.deviceId === selectedMicId && (
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Camera */}
          <div className="flex items-center">
            <Button
              variant={localWebcamOn ? "outline" : "secondary"}
              size="icon"
              className="size-11 rounded-r-none border-r-0 shadow-sm transition active:scale-95 sm:size-14"
              onClick={onToggleWebcam}
            >
              {localWebcamOn ? (
                <Video className="size-4 sm:size-5" />
              ) : (
                <VideoOff className="size-4 sm:size-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-8 rounded-l-none border-l border-white/10 px-0 shadow-sm transition active:scale-95 sm:h-14 sm:w-10"
                >
                  <ChevronDown className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {videoDevices.map((d) => (
                  <DropdownMenuItem
                    key={d.deviceId}
                    onClick={() => onChangeWebcam(d.deviceId)}
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="truncate">
                        {d.label || "Unknown Camera"}
                      </span>
                      {d.deviceId === selectedWebcamId && (
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Screen Share */}
          {(isModerator || isSessionOwner) && (
            <Button
              variant={localScreenShareOn ? "default" : "outline"}
              size="icon"
              className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
              onClick={onToggleScreenShare}
            >
              <MonitorUp className="size-4 sm:size-5" />
            </Button>
          )}

          {/* Raise Hand */}
          <Button
            variant={hasRaisedHand ? "default" : "outline"}
            size="icon"
            className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
            onClick={onRaiseHand}
          >
            <Hand className="size-4 sm:size-5" />
          </Button>

          {/* Mobile Chat Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14 xl:hidden"
              >
                <MessageSquare className="size-4 sm:size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              onOpenAutoFocus={(e) => e.preventDefault()}
              side="bottom"
              className="flex h-[90dvh] w-full flex-col rounded-t-2xl border-x-0 border-b-0 border-t p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:max-w-md sm:mx-auto pb-2"
            >
              <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />

              <SheetHeader className="border-b px-6 pb-3 pt-4">
                <SheetTitle className="text-center text-lg font-semibold tracking-tight">
                  Meeting Chat
                </SheetTitle>
              </SheetHeader>

              {/* Actual Chat Component Rendered Here */}
              <div className="min-h-0 flex-1 bg-background/50">
                <AgoraMeetingChat
                  localUid={localUid}
                  participantName={participantName}
                  client={client}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Leave/End Meeting */}
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
                  onClick={onLeaveMeeting}
                >
                  {isSessionOwner ? "End Session" : "Leave Session"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
