"use client";

import { Users } from "lucide-react";

import { MeetingCountdown } from "./meeting-countdown";
import { MeetingConnectionBadge } from "./meeting-connection-badge";
import { EndMeetingDialog } from "./end-meeting-dialog";
import { ConnectionQuality } from "../../../hoooks/use-participant-quality";

interface MeetingHeaderProps {
  sessionTitle: string;
  participantCount: number;
  isWaitingForOthers: boolean;
  isSessionOwner: boolean;
  isEndingMeeting: boolean;
  endsAt: string;
  connectionQuality: ConnectionQuality;
  onCountdownExpire?: () => void;
  onMobileCountdownExpire?: () => void;
  onEndMeeting: () => void;
}

export function MeetingHeader({
  sessionTitle,
  participantCount,
  isWaitingForOthers,
  isSessionOwner,
  isEndingMeeting,
  endsAt,
  connectionQuality,
  onCountdownExpire,
  onMobileCountdownExpire,
  onEndMeeting,
}: MeetingHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-muted-soft/95 backdrop-blur-xl">
      <div className="px-3 py-2 sm:px-4 xl:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {sessionTitle}
              </h1>

              {isWaitingForOthers && (
                <div className="shrink-0 rounded-full border border-amber-500/10 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium leading-none text-amber-200">
                  Waiting for others
                </div>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                <Users className="size-3" />

                <span className="tabular-nums">
                  {participantCount} participant
                  {participantCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden items-center gap-2 sm:flex">
            <MeetingConnectionBadge quality={connectionQuality} />

            <MeetingCountdown endsAt={endsAt} onExpire={onCountdownExpire} />

            {isSessionOwner && (
              <EndMeetingDialog
                isEndingMeeting={isEndingMeeting}
                onConfirm={onEndMeeting}
              />
            )}
          </div>

          {/* Mobile */}
          <div className="flex justify-end gap-2 sm:hidden">
            <MeetingConnectionBadge quality={connectionQuality} />

            <MeetingCountdown
              endsAt={endsAt}
              onExpire={onMobileCountdownExpire}
            />

            {isSessionOwner && (
              <EndMeetingDialog
                isEndingMeeting={isEndingMeeting}
                onConfirm={onEndMeeting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
