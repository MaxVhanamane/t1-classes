"use client";

import { format } from "date-fns";
import { Calendar } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

import { BatchLiveClass, LiveClassStatus } from "../../types/live-class.types";
import { LiveClassActionButton } from "./live-class-action-button";

type Props = {
  liveClass: BatchLiveClass;

  onOpen: (liveClass: BatchLiveClass) => void;
};

function getBadgeClass(status: LiveClassStatus) {
  if (status === "live") {
    return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "upcoming") {
    return "border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  return "border border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";
}

export function LiveClassCard({ liveClass, onOpen }: Props) {
  return (
    <Card className="relative rounded-lg border py-4 transition hover:bg-muted/40 md:w-2xl dark:bg-black">
      <DottedBackground />

      <CardContent className="relative z-10 space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-sm font-semibold">
              {liveClass.title}
            </h3>

            {liveClass.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {liveClass.description}
              </p>
            )}
          </div>

          <span
            className={`shrink-0 rounded-md px-2 py-1 text-xs capitalize ${getBadgeClass(
              liveClass.status,
            )}`}
          >
            {liveClass.status}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-muted-foreground" />

            <span>
              Starts {format(new Date(liveClass.startsAt), "d MMM · h:mm a")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-muted-foreground" />

            <span>
              Ends {format(new Date(liveClass.endsAt), "d MMM · h:mm a")}
            </span>
          </div>
        </div>

        <LiveClassActionButton
          status={liveClass.status}
          startsAt={liveClass.startsAt}
          onClick={() => onOpen(liveClass)}
        />
      </CardContent>
    </Card>
  );
}
