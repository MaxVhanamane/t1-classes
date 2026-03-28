"use client";

import { ExploreBatchDetail } from "@/src/app/api/explore-batches/[slug]/types";
import { Calendar, Clock, Globe, MapPin, Users } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Badge } from "@/src/components/ui/badge";

export function BatchMetaInline({ batch }: { batch: ExploreBatchDetail }) {
  const startDate = new Date(batch.start_date);
  const now = new Date();

  const rawDiff = differenceInDays(startDate, now);
  const daysLeft = rawDiff > 0 ? rawDiff : 0;

  return (
    <div className="space-y-4">
      {/* -------------------------------------------------- */}
      {/* Teaching Languages + Location                     */}
      {/* -------------------------------------------------- */}
      <div className="flex flex-col gap-2 text-sm">
        {/* Languages */}
        {batch.languages?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Teaching in:</span>

            <div className="flex flex-wrap gap-2">
              {batch.languages.slice(0, 3).map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="text-xs capitalize"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {(batch.mode === "offline" || batch.mode === "hybrid") &&
          batch.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                Location:{" "}
                <span className="text-foreground font-medium">
                  {batch.location}
                </span>
              </span>
            </div>
          )}
      </div>

      {/* -------------------------------------------------- */}
      {/* Timeline + Capacity                               */}
      {/* -------------------------------------------------- */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {/* Start Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Starts {format(startDate, "dd MMM yyyy")}</span>
        </div>

        {/* Countdown */}
        {daysLeft > 0 && (
          <div className="flex items-center gap-2 text-primary font-medium">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
            </span>
          </div>
        )}

        {/* Capacity */}
        {batch.capacity && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>Limited to {batch.capacity} students</span>
          </div>
        )}
      </div>
    </div>
  );
}
