"use client";

import { Wifi, WifiHigh, WifiLow, WifiOff } from "lucide-react";

interface MeetingConnectionBadgeProps {
  quality: "good" | "weak" | "poor" | "reconnecting";
}

export function MeetingConnectionBadge({
  quality,
}: MeetingConnectionBadgeProps) {
  const iconMap = {
    good: <WifiHigh className="size-3 text-emerald-500" />,
    weak: <Wifi className="size-3 text-amber-500" />,
    poor: <WifiLow className="size-3 text-red-500" />,
    reconnecting: <WifiOff className="size-3 animate-pulse text-blue-500" />,
  };

  const labelMap = {
    good: "Good",
    weak: "Weak",
    poor: "Poor",
    reconnecting: "Reconnecting",
  };

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-background border px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
      {iconMap[quality]}
      {labelMap[quality]}
    </div>
  );
}
