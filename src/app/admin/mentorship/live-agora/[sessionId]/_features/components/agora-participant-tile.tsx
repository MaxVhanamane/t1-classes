"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  MoreVertical,
  UserX,
  Video,
  VideoOff,
  Maximize,
  Minimize,
  MonitorUp,
} from "lucide-react";
import {
  LocalVideoTrack,
  RemoteVideoTrack,
  ILocalVideoTrack,
  IRemoteVideoTrack,
  RemoteAudioTrack, // Added
  IRemoteAudioTrack, // Added
} from "agora-rtc-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface AgoraParticipantTileProps {
  uid: string;
  isLocal: boolean;
  isModerator: boolean;
  displayName: string;
  micOn: boolean | undefined;
  cameraOn: boolean | undefined;
  isScreenSharing?: boolean;
  isLoadingVideo?: boolean;
  localVideoTrack?: ILocalVideoTrack | null;
  remoteVideoTrack?: IRemoteVideoTrack | null;
  remoteAudioTrack?: IRemoteAudioTrack | null; // Added
  onForceMute?: (uid: string) => void;
  onLiftMuteLock?: (uid: string) => void;
  onForceVideoMute?: (uid: string) => void;
  onLiftVideoLock?: (uid: string) => void;
  onKickUser?: (uid: string) => void;
}

export function AgoraParticipantTile({
  uid,
  isLocal,
  isModerator,
  displayName,
  micOn,
  cameraOn,
  isScreenSharing,
  isLoadingVideo = false,
  localVideoTrack,
  remoteVideoTrack,
  remoteAudioTrack, // Added
  onForceMute,
  onLiftMuteLock,
  onForceVideoMute,
  onLiftVideoLock,
  onKickUser,
}: AgoraParticipantTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isVideoReady = isLocal ? !!localVideoTrack : !!remoteVideoTrack;

  /* Sync Fullscreen State */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  /* Toggle Fullscreen Logic */
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        if (window.screen?.orientation?.lock) {
          window.screen.orientation.lock("landscape").catch(() => {});
        }
      } else {
        await document.exitFullscreen();
        if (window.screen?.orientation?.unlock) {
          window.screen.orientation.unlock();
        }
      }
    } catch {
      // Silently catch fullscreen errors
    }
  };
  console.log("!isLocal && remoteAudioTrack ", !isLocal && remoteAudioTrack);
  console.log(isLocal);
  console.log(remoteAudioTrack);
  return (
    <Card
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden bg-black p-0 w-full",
        isFullscreen
          ? "rounded-none border-none h-full"
          : "rounded-xl border aspect-4/3",
      )}
    >
      {/* AUDIO LAYER: This handles automatic playback of remote audio */}
      {!isLocal && remoteAudioTrack && (
        <RemoteAudioTrack track={remoteAudioTrack} play={true} />
      )}

      {/* BASE LAYER: Pure WebRTC video rendering. */}
      <div className="absolute inset-0">
        {isLocal && localVideoTrack ? (
          <LocalVideoTrack
            track={localVideoTrack}
            play={!!cameraOn}
            className={cn(
              "h-full w-full",
              isScreenSharing ? "object-contain" : "object-cover object-top",
            )}
          />
        ) : !isLocal && remoteVideoTrack ? (
          <RemoteVideoTrack
            track={remoteVideoTrack}
            play={!!cameraOn}
            className={cn(
              "h-full w-full",
              isScreenSharing ? "object-contain" : "object-cover object-top",
            )}
          />
        ) : null}
      </div>

      {/* OVERLAY LAYERS */}
      {!cameraOn ? (
        <div className="absolute inset-0 z-10">
          <DisabledVideoFallback />
        </div>
      ) : isLoadingVideo || !isVideoReady ? (
        <div className="absolute inset-0 z-10">
          <LoadingVideoFallback />
        </div>
      ) : null}

      {/* Screen Share Badge */}
      {isScreenSharing && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
          <MonitorUp className="size-3.5" />
          Sharing Screen
        </div>
      )}

      {/* MODERATOR CONTROLS & BADGES (Your existing code stays here) */}
      {/* ... */}

      {/* MODERATOR CONTROLS */}
      {isModerator && !isLocal && (
        <div className="absolute right-3 top-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="size-8 rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md hover:bg-black/50"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onForceMute?.(uid)}>
                <MicOff className="mr-2 size-4 text-destructive" />
                Force Mute Mic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLiftMuteLock?.(uid)}>
                <Mic className="mr-2 size-4 text-green-500" />
                Allow Mic Unmute
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onForceVideoMute?.(uid)}>
                <VideoOff className="mr-2 size-4 text-destructive" />
                Force Disable Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLiftVideoLock?.(uid)}>
                <Video className="mr-2 size-4 text-green-500" />
                Allow Video Enable
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onKickUser?.(uid)}
                className="text-destructive focus:text-destructive"
              >
                <UserX className="mr-2 size-4" />
                Remove Participant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* BADGES */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-linear-to-t from-black/60 to-transparent px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white shadow-black drop-shadow-md">
            {displayName} {isLocal && "(You)"}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isScreenSharing && (
            <button
              onClick={toggleFullscreen}
              className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/60"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="size-4 text-white" />
              ) : (
                <Maximize className="size-4 text-white" />
              )}
            </button>
          )}

          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full backdrop-blur sm:size-8",
              micOn ? "bg-black/40" : "bg-red-500/80",
            )}
          >
            {micOn ? (
              <Mic className="size-4 text-white" />
            ) : (
              <MicOff className="size-4 text-white" />
            )}
          </div>
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full backdrop-blur sm:size-8",
              cameraOn ? "bg-black/40" : "bg-red-500/80",
            )}
          >
            {cameraOn ? (
              <Video className="size-4 text-white" />
            ) : (
              <VideoOff className="size-4 text-white" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function DisabledVideoFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900">
      <div className="flex size-16 items-center justify-center rounded-full bg-white/5 backdrop-blur">
        <VideoOff className="size-7 text-zinc-400" />
      </div>
    </div>
  );
}

function LoadingVideoFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900">
      <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  );
}
