"use client";

import { Users, Info } from "lucide-react";
import { MeetingCountdown } from "./meeting-countdown";
import { EndMeetingDialog } from "./end-meeting-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";

interface MeetingHeaderProps {
  sessionTitle: string;
  sessionDescription: string | null;
  participantCount: number;
  isWaitingForOthers: boolean;
  isSessionOwner: boolean;
  isEndingMeeting: boolean;
  endsAt: string;
  onCountdownExpire?: () => void;
  onEndMeeting: () => void;
}

export function MeetingHeader({
  sessionTitle,
  sessionDescription,
  participantCount,
  isWaitingForOthers,
  isSessionOwner,
  isEndingMeeting,
  endsAt,
  onCountdownExpire,
  onEndMeeting,
}: MeetingHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-white/10 bg-muted-soft/95 px-3 backdrop-blur-xl lg:px-6">
      {/* LEFT SIDE: Info & Meta */}
      <div className="flex min-w-0 items-center gap-2 lg:gap-4">
        {/* Session Info Trigger */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group flex min-w-0 shrink-0 items-center gap-2 px-1 hover:bg-white/5 data-[state=open]:bg-white/5 lg:px-2"
            >
              {/* Uses "Info" up until 'lg' breakpoint */}
              <span className="text-sm font-medium lg:hidden">Info</span>

              {/* Full title only appears on 'lg' and up */}
              <span className="hidden truncate text-sm font-semibold lg:block lg:max-w-[300px] xl:max-w-[400px]">
                {sessionTitle}
              </span>

              <Info className="size-4 text-muted-foreground transition-colors group-hover:text-foreground group-data-[state=open]:text-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 bg-card lg:w-80">
            <div className="space-y-1.5">
              <h4 className="font-medium leading-tight">{sessionTitle}</h4>
              {sessionDescription ? (
                <p className="text-sm text-muted-foreground">
                  {sessionDescription}
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  No description provided.
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="h-4 w-px shrink-0 bg-border/60" />

        {/* Metadata Cluster (Status + Participants) */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Interactive Status Dot */}
          {isWaitingForOthers && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 outline-none transition-opacity hover:opacity-80">
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
                  </span>
                  {/* Full text stays hidden until 'lg' breakpoint */}
                  <span className="hidden text-xs font-medium text-amber-500 dark:text-amber-400 lg:block">
                    Waiting for others
                  </span>
                </button>
              </PopoverTrigger>
              {/* Popover only triggers on screens smaller than 'lg' */}
              <PopoverContent
                align="center"
                sideOffset={10}
                className="w-auto bg-card px-3 py-1.5 lg:hidden"
              >
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Waiting for others
                </p>
              </PopoverContent>
            </Popover>
          )}

          {/* Participant Count */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5" />
            <span className="text-xs font-medium tabular-nums text-foreground">
              {participantCount}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Controls */}
      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        <MeetingCountdown endsAt={endsAt} onExpire={onCountdownExpire} />
        {isSessionOwner && (
          <EndMeetingDialog
            isEndingMeeting={isEndingMeeting}
            onConfirm={onEndMeeting}
          />
        )}
      </div>
    </div>
  );
}
