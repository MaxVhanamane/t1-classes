"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
} from "date-fns";
import { CheckCircle2, Clock, Info, BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { HomeworkCalendarItem } from "../../types/homework.types";
import DottedBackground from "@/src/components/dotted-background";

type Props = {
  batchId: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export function BatchHomeworkCalendar({ batchId }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const {
    data: homeworkList = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["homework-calendar", batchId, year, month],
    queryFn: () =>
      fetchWrapper<HomeworkCalendarItem[]>(
        `/api/student/batches/${batchId}/homework/calendar?year=${year}&month=${month}`,
      ),
    staleTime: 1000 * 60,
  });

  // Group by PUBLISH DATE
  const homeworkByDate = useMemo(() => {
    const map = new Map<string, HomeworkCalendarItem[]>();
    homeworkList.forEach((hw) => {
      const dateKey = format(new Date(hw.publish_date), "yyyy-MM-dd");
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(hw);
    });
    return map;
  }, [homeworkList]);

  // Calculate Monthly Stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    let completed = 0;
    let missed = 0;
    let pending = 0;

    homeworkList.forEach((hw) => {
      if (hw.is_completed) {
        completed++;
      } else if (new Date(hw.due_date) < now) {
        missed++;
      } else {
        pending++;
      }
    });

    return { total: homeworkList.length, completed, missed, pending };
  }, [homeworkList]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDateOffset = getDay(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  function getDayStatus(items: HomeworkCalendarItem[]) {
    if (!items || items.length === 0) return "none";

    const now = new Date();
    const hasMissed = items.some(
      (hw) => !hw.is_completed && new Date(hw.due_date) < now,
    );
    if (hasMissed) return "missed";

    const hasPending = items.some(
      (hw) => !hw.is_completed && new Date(hw.due_date) >= now,
    );
    if (hasPending) return "pending";

    return "completed";
  }

  return (
    <Card className="overflow-hidden border shadow-none py-4 dark:bg-black w-full md:max-w-[380px]">
      <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3 sm:px-4">
        <div className="flex items-center gap-2">
          <Select
            value={currentDate.getMonth().toString()}
            onValueChange={(v) => {
              const d = new Date(currentDate);
              d.setMonth(parseInt(v));
              setCurrentDate(d);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] sm:w-[120px] text-xs sm:text-sm font-semibold border-border/50 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year.toString()}
            onValueChange={(v) => {
              const d = new Date(currentDate);
              d.setFullYear(parseInt(v));
              setCurrentDate(d);
            }}
          >
            <SelectTrigger className="h-8 w-[75px] sm:w-[80px] text-xs sm:text-sm font-semibold border-border/50 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Monthly Summary Info Button (No scrolling needed, it's short) */}
        <RichPopover
          color="gray"
          title={`${MONTHS[currentDate.getMonth()]} Overview`}
          description="A summary of your assignments published this month."
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
            >
              <Info className="size-4 text-muted-foreground" />
            </Button>
          }
        >
          <div className="flex flex-col gap-2 mt-3 p-3 bg-muted/20 rounded-xl border border-border/50 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">
                Total Assigned:
              </span>
              <span className="font-bold text-foreground">
                {monthlyStats.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">
                Completed:
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {monthlyStats.completed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">
                Pending:
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {monthlyStats.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">
                Not Completed:
              </span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {monthlyStats.missed}
              </span>
            </div>
          </div>
        </RichPopover>
      </CardHeader>

      <CardContent className="p-4 sm:p-4 relative">
        <DottedBackground />
        <div
          className={cn(
            "transition-all duration-300",
            isFetching
              ? "animate-pulse opacity-70 pointer-events-none"
              : "opacity-100",
          )}
        >
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-3">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {Array.from({ length: startDateOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const itemsForDay = homeworkByDate.get(dateKey) || [];
              const status = getDayStatus(itemsForDay);

              let bgClass = "bg-background hover:bg-muted";
              let borderClass = "border border-border/40 shadow-sm";
              let textClass = "text-foreground font-medium";
              let popoverColor: "gray" | "green" | "amber" | "red" = "gray";

              if (status === "completed") {
                popoverColor = "green";
                borderClass =
                  "border border-green-500/50 dark:border-green-500/40 shadow-sm";
                bgClass = "bg-green-500/5 hover:bg-green-500/10";
                textClass = "text-green-700 dark:text-green-400 font-bold";
              } else if (status === "missed") {
                popoverColor = "red";
                borderClass =
                  "border border-red-500/50 dark:border-red-500/40 shadow-sm";
                bgClass = "bg-red-500/5 hover:bg-red-500/10";
                textClass = "text-red-700 dark:text-red-400 font-bold";
              } else if (status === "pending") {
                popoverColor = "amber";
                borderClass =
                  "border border-amber-500/50 dark:border-amber-500/40 shadow-sm";
                bgClass = "bg-amber-500/5 hover:bg-amber-500/10";
                textClass = "text-amber-700 dark:text-amber-400 font-bold";
              }

              const cellContent = (
                <div
                  className={cn(
                    "relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl transition-colors",
                    bgClass,
                    borderClass,
                  )}
                >
                  {isLoading ? (
                    <Skeleton className="size-4 rounded-full" />
                  ) : (
                    <span className={cn("text-xs sm:text-sm", textClass)}>
                      {format(day, "d")}
                    </span>
                  )}

                  {status !== "none" && !isLoading && (
                    <div
                      className={cn(
                        "absolute bottom-1.5 size-1 sm:size-1.5 rounded-full",
                        status === "completed" &&
                          "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]",
                        status === "missed" &&
                          "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]",
                        status === "pending" &&
                          "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
                      )}
                    />
                  )}
                </div>
              );

              if (itemsForDay.length === 0) {
                return <div key={dateKey}>{cellContent}</div>;
              }

              const metaTextStr = `${itemsForDay.length} Assignment${itemsForDay.length > 1 ? "s" : ""}`;

              return (
                <RichPopover
                  key={dateKey}
                  color={popoverColor}
                  title={format(day, "EEEE, MMMM do")}
                  metaText={metaTextStr}
                  scrollable={true} // <-- NEW SCROLL FEATURE ENABLED
                  scrollClass="max-h-[220px]" // Perfect height for a list of assignments
                  trigger={
                    <button type="button" className="focus:outline-none">
                      {cellContent}
                    </button>
                  }
                >
                  <div className="flex flex-col gap-2.5 mt-3">
                    {itemsForDay.map((hw) => {
                      const isDone = hw.is_completed;
                      const isMissed =
                        !isDone && new Date(hw.due_date) < new Date();

                      return (
                        <div
                          key={hw.id}
                          className="flex flex-col items-start gap-2 rounded-lg border bg-background p-3"
                        >
                          <p className="text-[11px] font-semibold leading-relaxed text-foreground line-clamp-2">
                            {hw.title}
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground w-full">
                            <BookOpen className="size-3" />
                            <span className="capitalize">{hw.subject}</span>
                          </div>

                          <div className="flex flex-col w-full gap-1 mt-1 text-[10px] text-muted-foreground bg-muted/20 p-1.5 rounded border border-border/30">
                            <div className="flex justify-between">
                              <span>Given:</span>
                              <span className="font-medium text-foreground">
                                {format(new Date(hw.publish_date), "MMM d")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Due:</span>
                              <span
                                className={cn(
                                  "font-medium",
                                  isMissed && "text-red-500",
                                )}
                              >
                                {format(new Date(hw.due_date), "MMM d")}
                              </span>
                            </div>
                          </div>

                          <div className="flex w-full mt-1">
                            {isDone ? (
                              <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                <CheckCircle2 className="size-2.5" /> Completed
                              </span>
                            ) : isMissed ? (
                              <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                <Clock className="size-2.5" /> Not Completed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                <Clock className="size-2.5" /> Pending
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </RichPopover>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
