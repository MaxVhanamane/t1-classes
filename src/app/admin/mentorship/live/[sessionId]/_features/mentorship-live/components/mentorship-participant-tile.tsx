"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChevronDown,
  Mic,
  MicOff,
  MonitorUp,
  MoreVertical,
  UserX,
  Video,
  VideoOff,
  Wifi,
  Maximize,
  Minimize,
} from "lucide-react";

import { useParticipant } from "@videosdk.live/react-sdk";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { MeetingNetworkStats } from "./meeting-network-stats";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

import { type ParticipantQualityState } from "../../../hoooks/use-participant-quality";
import { cn } from "@/src/lib/utils";

interface MentorshipParticipantTileProps {
  participantId: string;
  isModerator: boolean;
  totalParticipants: number;
  localParticipantQuality?: ParticipantQualityState;
}

export function MentorshipParticipantTile({
  participantId,
  isModerator,
  localParticipantQuality,
}: MentorshipParticipantTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const participantQuality = localParticipantQuality;
  const {
    displayName,
    webcamStream,
    micStream,
    screenShareStream,
    webcamOn,
    micOn,
    screenShareOn,
    isLocal,
    disableMic,
    disableWebcam,
    remove,
  } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      return new MediaStream([webcamStream.track]);
    }
    return null;
  }, [webcamOn, webcamStream]);

  const screenShareMediaStream = useMemo(() => {
    if (screenShareOn && screenShareStream) {
      return new MediaStream([screenShareStream.track]);
    }
    return null;
  }, [screenShareOn, screenShareStream]);

  const activeVideoStream = screenShareMediaStream ?? videoStream;

  const audioStream = useMemo(() => {
    if (micOn && micStream) {
      return new MediaStream([micStream.track]);
    }
    return null;
  }, [micOn, micStream]);

  /* Attach video stream */
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !activeVideoStream) {
      if (videoElement) videoElement.srcObject = null;
      return;
    }
    if (videoElement.srcObject === activeVideoStream) return;
    videoElement.srcObject = activeVideoStream;
  }, [activeVideoStream]);

  /* Attach audio stream */
  useEffect(() => {
    const audioElement = micRef.current;
    if (!audioElement || !audioStream) {
      if (audioElement) audioElement.srcObject = null;
      return;
    }
    audioElement.srcObject = audioStream;
    audioElement.play().catch(() => null);
  }, [audioStream]);

  /* Sync Fullscreen State (handles ESC key exits) */
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

    // Interface for non-standard browser orientation methods
    interface ExtendedScreenOrientation extends ScreenOrientation {
      lock(orientation: string): Promise<void>;
      unlock(): void;
    }

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();

        const orientation = window.screen
          ?.orientation as ExtendedScreenOrientation;
        if (orientation?.lock) {
          orientation.lock("landscape").catch(() => {});
        }
      } else {
        await document.exitFullscreen();

        const orientation = window.screen
          ?.orientation as ExtendedScreenOrientation;
        if (orientation?.unlock) {
          orientation.unlock();
        }
      }
    } catch {
      // Silently catch fullscreen errors
    }
  };
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
      {/* Video Layer */}
      <div className="absolute inset-0">
        {activeVideoStream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isLocal}
              onWaiting={() => setIsVideoLoading(true)}
              onPlaying={() => setIsVideoLoading(false)}
              onLoadedData={() => setIsVideoLoading(false)}
              className={`
                h-full w-full transition-opacity duration-300
                ${screenShareOn ? "object-contain bg-black" : "object-cover object-top"}
              `}
            />

            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-900 to-zinc-800">
            <div className="flex flex-col items-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-white/5 backdrop-blur">
                <VideoOff className="size-7 text-zinc-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Screen Share Badge */}
      {screenShareOn && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
          <MonitorUp className="size-3.5" />
          Sharing Screen
        </div>
      )}

      {/* Local Network Quality */}
      {isLocal && participantQuality && (
        <div
          className={`absolute left-3 z-20 ${screenShareOn ? "top-14" : "top-3"}`}
        >
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 rounded-full border border-white/10 bg-black/45 px-2 py-1.5 backdrop-blur-md transition hover:bg-black/60">
                <Wifi
                  className={`size-3.5 shrink-0 ${
                    participantQuality.quality === "good"
                      ? "text-emerald-400"
                      : participantQuality.quality === "weak"
                        ? "text-amber-400"
                        : participantQuality.quality === "poor"
                          ? "text-red-400"
                          : "animate-pulse text-blue-400"
                  }`}
                />
                <ChevronDown className="size-3 text-white/70" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              className="w-auto rounded-2xl border-white/10 bg-background/95 p-4 backdrop-blur-xl"
            >
              <MeetingNetworkStats
                stats={participantQuality}
                videoEnabled={webcamOn || screenShareOn}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Moderator Actions */}
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
              <DropdownMenuItem onClick={() => disableMic()}>
                <MicOff className="mr-2 size-4" /> Mute Participant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => disableWebcam()}>
                <VideoOff className="mr-2 size-4" /> Disable Camera
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => remove()}
                className="text-destructive focus:text-destructive"
              >
                <UserX className="mr-2 size-4" /> Remove Participant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Bottom Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white shadow-black drop-shadow-md">
            {displayName} {isLocal && " (You)"}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* Fullscreen Toggle (Only shows during Screen Share) */}
          {screenShareOn && (
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
            className={`flex size-7 sm:size-8 items-center justify-center rounded-full backdrop-blur ${micOn ? "bg-black/40" : "bg-red-500/80"}`}
          >
            {micOn ? (
              <Mic className="size-4 text-white" />
            ) : (
              <MicOff className="size-4 text-white" />
            )}
          </div>

          <div
            className={`flex size-7 sm:size-8 items-center justify-center rounded-full backdrop-blur ${webcamOn ? "bg-black/40" : "bg-red-500/80"}`}
          >
            {webcamOn ? (
              <Video className="size-4 text-white" />
            ) : (
              <VideoOff className="size-4 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Audio */}
      <audio autoPlay playsInline ref={micRef} />
    </Card>
  );
}
