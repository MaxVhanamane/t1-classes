"use client";

import {
  Activity,
  Gauge,
  LucideIcon,
  TimerReset,
  Video,
  Wifi,
} from "lucide-react";

import type { ParticipantQualityState } from "../../../hoooks/use-participant-quality";

interface MeetingNetworkStatsProps {
  stats: ParticipantQualityState;

  videoEnabled: boolean;
}

export function MeetingNetworkStats({
  stats,
  videoEnabled,
}: MeetingNetworkStatsProps) {
  const getVideoMetricValue = (hasValue: boolean, value: string) => {
    /*
      Reconnecting state
    */
    if (stats.quality === "reconnecting") {
      return {
        text: "Reconnecting...",
        muted: true,
      };
    }

    /*
      No active video stream
    */
    if (!videoEnabled) {
      return {
        text: "Camera Off",
        muted: true,
      };
    }

    /*
      Valid metric available
    */
    if (hasValue) {
      return {
        text: value,
        muted: false,
      };
    }

    /*
      Stats unavailable
    */
    return {
      text: "Unavailable",
      muted: true,
    };
  };

  const bitrateValue = getVideoMetricValue(
    stats.bitrate > 0,
    `${stats.bitrate.toFixed(1)} kbps`,
  );

  const resolutionValue = getVideoMetricValue(
    stats.width > 0 && stats.height > 0,
    `${stats.width}×${stats.height}`,
  );

  const fpsValue = getVideoMetricValue(
    stats.fps > 0,
    `${Math.round(stats.fps)} FPS`,
  );

  return (
    <div className="w-72 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Connection Stats</h3>

        <p className="text-xs text-muted-foreground">
          Real-time meeting diagnostics
        </p>
      </div>

      <div className="space-y-2">
        {/* Network Metrics */}

        <Metric
          icon={TimerReset}
          label="Latency"
          value={`${Math.round(stats.rtt)} ms`}
        />

        <Metric
          icon={Activity}
          label="Jitter"
          value={`${Math.round(stats.jitter)} ms`}
        />

        <Metric
          icon={Wifi}
          label="Packet Loss"
          value={`${stats.packetLoss.toFixed(1)}%`}
        />

        {/* Video Metrics */}

        <Metric
          icon={Gauge}
          label="Bitrate"
          value={bitrateValue.text}
          muted={bitrateValue.muted}
        />

        <Metric
          icon={Video}
          label="Resolution"
          value={resolutionValue.text}
          muted={resolutionValue.muted}
        />

        <Metric
          icon={Video}
          label="Frame Rate"
          value={fpsValue.text}
          muted={fpsValue.muted}
        />
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: LucideIcon;

  label: string;

  value: string;

  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />

        <span className="text-xs">{label}</span>
      </div>

      <span
        className={`
          font-medium
          ${muted ? "text-xs text-muted-foreground" : "text-xs"}
        `}
      >
        {value}
      </span>
    </div>
  );
}
