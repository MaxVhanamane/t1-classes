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
  const getVideoMetricValue = (fallback: string) => {
    /*
      Reconnecting state
    */

    if (stats.quality === "reconnecting") {
      return "Reconnecting...";
    }

    /*
      No active video stream
    */

    if (!videoEnabled) {
      return "Camera Off";
    }

    /*
      Waiting for initial stats
    */

    return fallback;
  };

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
          value={
            stats.bitrate > 0
              ? `${stats.bitrate.toFixed(1)} kbps`
              : getVideoMetricValue("Collecting...")
          }
        />

        <Metric
          icon={Video}
          label="Resolution"
          value={
            stats.width > 0 && stats.height > 0
              ? `${stats.width}×${stats.height}`
              : getVideoMetricValue("Collecting...")
          }
        />

        <Metric
          icon={Video}
          label="Frame Rate"
          value={
            stats.fps > 0
              ? `${Math.round(stats.fps)} FPS`
              : getVideoMetricValue("Collecting...")
          }
        />
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;

  label: string;

  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />

        <span className="text-sm">{label}</span>
      </div>

      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
