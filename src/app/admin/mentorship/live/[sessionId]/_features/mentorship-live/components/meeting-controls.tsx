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

import { MentorshipMeetingChat } from "./mentorship-meeting-chat";

interface MeetingControlsProps {
  isModerator: boolean;
  isSessionOwner: boolean;
  selectedMicId: string;
  selectedWebcamId: string;
  localMicOn: boolean;
  localWebcamOn: boolean;
  localScreenShareOn: boolean;

  hasRaisedHand: boolean;

  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];

  onToggleMic: () => void;
  onToggleWebcam: () => void;
  onToggleScreenShare: () => void;

  onChangeMic: (deviceId: string) => void;
  onChangeWebcam: (deviceId: string) => void;

  onRaiseHand: () => Promise<void>;
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

  onToggleMic,
  onToggleWebcam,
  onToggleScreenShare,

  onChangeMic,
  onChangeWebcam,
  selectedMicId,
  selectedWebcamId,
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
                {audioDevices.map((device) => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onChangeMic(device.deviceId)}
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="truncate">
                        {device.label || "Unknown Microphone"}
                      </span>

                      {device.deviceId === selectedMicId && (
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
                {videoDevices.map((device) => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onChangeWebcam(device.deviceId)}
                  >
                    {device.label || "Unknown Camera"}
                    {device.deviceId === selectedWebcamId && (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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

          <Button
            variant={hasRaisedHand ? "default" : "outline"}
            size="icon"
            className="size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14"
            onClick={onRaiseHand}
          >
            <Hand className="size-4 sm:size-5" />
          </Button>

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
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              side="right"
              className="top-4 flex h-[80dvh] w-[90vw] flex-col rounded-l-3xl border-l p-0 shadow-2xl sm:max-w-md"
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
