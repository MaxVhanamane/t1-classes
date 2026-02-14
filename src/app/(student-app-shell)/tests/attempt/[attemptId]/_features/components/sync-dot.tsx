"use client";

import { CheckCircle, AlertCircle, Loader2, Wifi } from "lucide-react";
import clsx from "clsx";
import { SyncStatus } from "../hooks/use-sync-status";

type Props = {
  status: SyncStatus;
};

export default function SyncDot({ status }: Props) {
  if (status.isIdle) return null;

  let label = "Saved";
  let Icon = CheckCircle;
  let color = "text-green-500";

  if (status.isRetrying) {
    label = "Reconnecting…";
    Icon = Wifi;
    color = "text-yellow-500 animate-pulse";
  } else if (status.isSaving) {
    label = "Saving…";
    Icon = Loader2;
    color = "text-blue-500 animate-spin";
  } else if (status.isError) {
    label = "Error";
    Icon = AlertCircle;
    color = "text-red-500";
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className={clsx("h-4 w-4", color)} />
      <span>{label}</span>
    </div>
  );
}
