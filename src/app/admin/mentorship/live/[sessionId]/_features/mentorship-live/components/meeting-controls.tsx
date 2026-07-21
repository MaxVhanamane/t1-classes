"use client";

import { useState } from "react";
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

import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";

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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/src/components/ui/drawer";

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
  // --- VideoSDK Unread Logic ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get the local participant so we don't count our own messages
  const { localParticipant } = useMeeting();

  // Listen directly to the chat topic without needing full state
  usePubSub("MENTORSHIP_CHAT", {
    onMessageReceived: (message) => {
      try {
        const parsed = JSON.parse(message.message);
        // Only increment if chat is closed AND the message wasn't sent by us
        if (!isChatOpen && parsed.senderId !== localParticipant?.id) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("[UNREAD_BADGE_PARSE_ERROR]", error);
      }
    },
  });

  const handleChatOpenChange = (open: boolean) => {
    setIsChatOpen(open);
    if (open) {
      // Clear badge when chat is opened
      setUnreadCount(0);
    }
  };
  // ----------------------------------

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
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="truncate">
                        {device.label || "Unknown Camera"}
                      </span>
                      {device.deviceId === selectedWebcamId && (
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
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

          {/* Mobile Chat Drawer */}
          <Drawer
            open={isChatOpen}
            onOpenChange={handleChatOpenChange}
            repositionInputs={false}
          >
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative size-11 shrink-0 rounded-full shadow-sm transition active:scale-95 sm:size-14 xl:hidden"
              >
                <MessageSquare className="size-4 sm:size-5" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] animate-in zoom-in items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm sm:-right-1.5 sm:-top-1.5 sm:h-6 sm:min-w-[24px] sm:text-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DrawerTrigger>

            {/* Forced height, radius, and removed shadow */}
            <DrawerContent className="flex w-full flex-col border-x-0 border-b-0 border-t p-0 pb-2 sm:mx-auto sm:max-w-md data-[vaul-drawer-direction=bottom]:h-[90dvh] data-[vaul-drawer-direction=bottom]:max-h-[95vh] data-[vaul-drawer-direction=bottom]:rounded-t-2xl">
              <DrawerHeader className="border-b px-6 pb-3 pt-2">
                <DrawerTitle className="text-center text-lg font-semibold tracking-tight">
                  Meeting Chat
                </DrawerTitle>
              </DrawerHeader>

              <div className="min-h-0 flex-1 bg-background/50">
                <MentorshipMeetingChat />
              </div>
            </DrawerContent>
          </Drawer>

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
