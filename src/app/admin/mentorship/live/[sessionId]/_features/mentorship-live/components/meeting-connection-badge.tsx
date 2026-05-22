import { Wifi } from "lucide-react";

import { cn } from "@/src/lib/utils";

import { ConnectionQuality } from "../../../hoooks/use-participant-quality";

interface MeetingConnectionBadgeProps {
  quality: ConnectionQuality;
}

export function MeetingConnectionBadge({
  quality,
}: MeetingConnectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-all",

        quality === "good" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

        quality === "weak" &&
          "border-amber-500/20 bg-amber-500/10 text-amber-300",

        quality === "poor" && "border-red-500/20 bg-red-500/10 text-red-300",

        quality === "reconnecting" &&
          "border-blue-500/20 bg-blue-500/10 text-blue-300",
      )}
    >
      <Wifi
        className={cn(
          "size-3.5 shrink-0 transition-all",

          quality === "good" && "opacity-100",

          quality === "weak" && "opacity-85",

          quality === "poor" && "opacity-90",

          quality === "reconnecting" && "animate-pulse opacity-90",
        )}
      />

      <span className="leading-none">
        {quality === "good" && "Connection Good"}

        {quality === "weak" && "Weak Network"}

        {quality === "poor" && "Poor Connection"}

        {quality === "reconnecting" && "Reconnecting"}
      </span>
    </div>
  );
}
