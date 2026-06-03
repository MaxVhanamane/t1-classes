"use client";

import { useEffect, useState } from "react";

import { cn } from "@/src/lib/utils";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/src/components/ui/hover-card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

type AttendanceSessionHeaderProps = {
  batchTitle: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  createdByName: string | null;
  createdAt: string;
};

export function AttendanceSessionHeader({
  batchTitle,
  totalStudents,
  presentCount,
  absentCount,
  createdAt,
  createdByName,
}: AttendanceSessionHeaderProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");

    const update = () => {
      setIsTouchDevice(media.matches);
    };

    update();

    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));

  const attendanceBadgeClass =
    attendanceRate >= 90
      ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : attendanceRate >= 75
        ? "border-blue-500/15 bg-blue-500/10 text-blue-600 dark:text-blue-400"
        : attendanceRate >= 50
          ? "border-amber-500/15 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-rose-500/15 bg-rose-500/10 text-rose-600 dark:text-rose-400";

  const PercentageTrigger = (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        attendanceBadgeClass,
      )}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-current" />
      {attendanceRate}%
    </button>
  );

  const PercentageContent = (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Attendance Rate</p>

        <p className="text-muted-foreground mt-1 text-sm">
          {presentCount} out of {totalStudents} students are marked present.
        </p>
      </div>

      <div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full",
              attendanceRate >= 90
                ? "bg-emerald-500"
                : attendanceRate >= 75
                  ? "bg-blue-500"
                  : attendanceRate >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500",
            )}
            style={{
              width: `${attendanceRate}%`,
            }}
          />
        </div>

        <p className="text-muted-foreground mt-2 text-xs">
          {attendanceRate}% attendance
        </p>
      </div>
    </div>
  );

  const MetadataContent = (
    <div className="space-y-3">
      <div>
        <p className="text-muted-foreground text-xs">Created By</p>

        <p className="text-sm font-medium">{createdByName ?? "Unknown"}</p>
      </div>

      <div>
        <p className="text-muted-foreground text-xs">Created At</p>

        <p className="text-sm font-medium">{formattedDate}</p>
      </div>
    </div>
  );
  return (
    <div className="rounded-2xl border bg-card p-4 max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold tracking-tight md:text-lg">
            {batchTitle}
          </h2>

          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-xs md:text-sm">
            <span>{totalStudents} students</span>

            <span>•</span>

            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {presentCount} present
            </span>

            <span>•</span>

            <span className="font-medium text-rose-600 dark:text-rose-400">
              {absentCount} absent
            </span>
          </div>

          <div className="mt-2">
            {isTouchDevice ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className=" block max-w-full truncate text-left text-xs"
                  >
                    <p className="text-muted-foreground truncate text-xs">
                      Created by{" "}
                      <span className="font-medium text-foreground">
                        {createdByName ?? "Unknown"}
                      </span>{" "}
                      • {formattedDate}
                    </p>
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-72 rounded-2xl border-border/60 bg-background/95 p-4  backdrop-blur-xl"
                >
                  {MetadataContent}
                </PopoverContent>
              </Popover>
            ) : (
              <p className="text-muted-foreground truncate text-xs">
                Created by{" "}
                <span className="font-medium text-foreground">
                  {createdByName ?? "Unknown"}
                </span>{" "}
                • {formattedDate}
              </p>
            )}
          </div>
        </div>

        <div>
          {isTouchDevice ? (
            <Popover>
              <PopoverTrigger asChild>{PercentageTrigger}</PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-72 rounded-2xl border-border/60 bg-background/95 p-4  backdrop-blur-xl"
              >
                {PercentageContent}
              </PopoverContent>
            </Popover>
          ) : (
            <HoverCard openDelay={150}>
              <HoverCardTrigger asChild>{PercentageTrigger}</HoverCardTrigger>

              <HoverCardContent
                align="end"
                className="w-72 rounded-2xl border-border/60 bg-background/95 p-4 backdrop-blur-xl"
              >
                {PercentageContent}
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </div>
    </div>
  );
}
