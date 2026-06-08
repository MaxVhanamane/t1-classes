"use client";

import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

import DottedBackground from "@/src/components/dotted-background";

type Props = {
  attendanceDate: string;

  status: "present" | "absent";
};

export function AttendanceRecentCard({ attendanceDate, status }: Props) {
  const isPresent = status === "present";

  return (
    <Card
      className={`group relative overflow-hidden border border-border/50 transition-all duration-200 bg-background ${
        isPresent
          ? "border-l-4 border-l-emerald-500"
          : "border-l-4 border-l-red-500"
      }`}
    >
      <DottedBackground />

      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isPresent ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}
            >
              {isPresent ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div>
              <p className="font-medium">
                {format(new Date(attendanceDate), "d MMM yyyy")}
              </p>

              <p className="text-muted-foreground text-xs">
                {format(new Date(attendanceDate), "EEEE")}
              </p>
            </div>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isPresent
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {isPresent ? "Present" : "Absent"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
