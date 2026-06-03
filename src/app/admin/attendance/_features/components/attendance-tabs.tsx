"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { CheckSquare, History, BarChart3, UserRound } from "lucide-react";

import { TakeAttendanceView } from "./take-attendance/take-attendance-view";
import { AttendanceHistoryView } from "./history/attendance-history-view";
import { BatchReportView } from "./batch-report/batch-report-view";
import { StudentReportView } from "./student-report/student-report-view";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs";

type AttendanceTab = "take" | "history" | "batch-report" | "student-report";

export function AttendanceTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabsListRef = useRef<HTMLDivElement>(null);

  const activeTab = (searchParams.get("tab") as AttendanceTab | null) ?? "take";

  useEffect(() => {
    const tabsList = tabsListRef.current;

    if (!tabsList) return;

    const activeTrigger = tabsList.querySelector(
      '[data-state="active"]',
    ) as HTMLElement | null;

    activeTrigger?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("tab", value);

    router.replace(`/admin/attendance?${params.toString()}`);
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      <div className="bg-muted/30 rounded-lg p-2">
        <TabsList
          ref={tabsListRef}
          className="
            bg-transparent
            flex h-auto w-full justify-start
            gap-2
            overflow-x-auto
            px-1 pt-1 pb-3
            md:pb-1
            scroll-smooth
          "
        >
          <TabsTrigger
            value="take"
            className="
              min-w-fit whitespace-nowrap
              rounded-lg px-4 py-2.5
              transition-all

              data-[state=active]:bg-background
              data-[state=active]:border-border/60
              data-[state=active]:border
              data-[state=active]:shadow-none
            "
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Take Attendance
          </TabsTrigger>

          <TabsTrigger
            value="history"
            className="
              min-w-fit whitespace-nowrap
              rounded-lg px-4 py-2.5
              transition-all

              data-[state=active]:bg-background
              data-[state=active]:border-border/60
              data-[state=active]:border
              data-[state=active]:shadow-none
            "
          >
            <History className="mr-2 h-4 w-4" />
            Session History
          </TabsTrigger>

          <TabsTrigger
            value="batch-report"
            className="
              min-w-fit whitespace-nowrap
              rounded-lg px-4 py-2.5
              transition-all

              data-[state=active]:bg-background
              data-[state=active]:border-border/60
              data-[state=active]:border
              data-[state=active]:shadow-none
            "
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Batch Reports
          </TabsTrigger>

          <TabsTrigger
            value="student-report"
            className="
              min-w-fit whitespace-nowrap
              rounded-lg px-4 py-2.5
              transition-all

              data-[state=active]:bg-background
              data-[state=active]:border-border/60
              data-[state=active]:border
              data-[state=active]:shadow-none
            "
          >
            <UserRound className="mr-2 h-4 w-4" />
            Student Reports
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="take" className="mt-0">
        <TakeAttendanceView />
      </TabsContent>

      <TabsContent value="history" className="mt-0">
        <AttendanceHistoryView />
      </TabsContent>

      <TabsContent value="batch-report" className="mt-0">
        <BatchReportView />
      </TabsContent>

      <TabsContent value="student-report" className="mt-0">
        <StudentReportView />
      </TabsContent>
    </Tabs>
  );
}
