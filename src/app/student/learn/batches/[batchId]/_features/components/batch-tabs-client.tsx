"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/src/components/ui/button";

import { CourseCard } from "./batch-course-card";

import BatchTestsPanel from "./batch-tests-panel";
import BatchLiveClassesPanel from "./batch-live-classes-panel";
import BatchMentorshipSessionsPanel from "./batch-mentorship-sessions-panel";
import BatchGroupSessionsPanel from "./batch-group-sessions-panel";

import { BatchDetailsResponse } from "@/src/types/batches.types";
import { BatchAttendancePanel } from "./batch-attendance-panel";

type TabKey =
  | "courses"
  | "tests"
  | "live-classes"
  | "mentorship"
  | "group-sessions"
  | "attendance";

const tabs: {
  key: TabKey;
  label: string;
}[] = [
  {
    key: "courses",
    label: "Courses",
  },
  {
    key: "tests",
    label: "Tests",
  },
  {
    key: "live-classes",
    label: "Live Classes",
  },
  {
    key: "mentorship",
    label: "Mentorship",
  },
  {
    key: "group-sessions",
    label: "Group Sessions",
  },
  {
    key: "attendance",
    label: "Attendance",
  },
];

type Props = {
  batchId: string;
  courses: BatchDetailsResponse["courses"];
  initialTab?: string;
};

function TabButton({
  active,
  label,
  onClick,
  ...props
}: {
  active: boolean;
  label: string;
  onClick: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="relative shrink-0" {...props}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={
          active ? "font-medium text-foreground" : "text-muted-foreground"
        }
      >
        {label}
      </Button>

      {active && (
        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
      )}
    </div>
  );
}
export default function BatchTabsClient({
  batchId,
  courses,
  initialTab,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    tabs.some((tab) => tab.key === initialTab)
      ? (initialTab as TabKey)
      : "courses",
  );

  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(() => {
    return tabs.findIndex((tab) => tab.key === activeTab);
  }, [activeTab]);

  function goToTab(index: number) {
    const tab = tabs[index];

    if (!tab) return;

    setActiveTab(tab.key);

    const params = new URLSearchParams(window.location.search);

    params.set("tab", tab.key);

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }

  function handleSwipe(
    _: PointerEvent,
    info: {
      offset: {
        x: number;
      };
      velocity: {
        x: number;
      };
    },
  ) {
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;

    if (swipePower < -12000 && activeIndex < tabs.length - 1) {
      goToTab(activeIndex + 1);
    }

    if (swipePower > 12000 && activeIndex > 0) {
      goToTab(activeIndex - 1);
    }
  }

  useEffect(() => {
    const activeButton = tabsContainerRef.current?.querySelector(
      '[data-active="true"]',
    );

    if (!activeButton) return;

    activeButton.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);
  return (
    <>
      <div className="mb-6 border-b">
        <div
          ref={tabsContainerRef}
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              active={activeIndex === index}
              data-active={activeIndex === index}
              onClick={() => goToTab(index)}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            drag="x"
            dragMomentum={false}
            dragSnapToOrigin
            dragConstraints={{
              left: 0,
              right: 0,
            }}
            dragElastic={0.04}
            onDragEnd={handleSwipe}
            initial={{
              opacity: 0,
              x: 12,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -12,
            }}
            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}
            className="touch-pan-y"
          >
            {activeTab === "courses" && (
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    batchId={batchId}
                  />
                ))}
              </section>
            )}

            {activeTab === "tests" && (
              <section className="mb-6">
                <BatchTestsPanel batchId={batchId} />
              </section>
            )}

            {activeTab === "live-classes" && (
              <section className="mb-6">
                <BatchLiveClassesPanel batchId={batchId} />
              </section>
            )}

            {activeTab === "mentorship" && (
              <section className="mb-6">
                <BatchMentorshipSessionsPanel batchId={batchId} />
              </section>
            )}

            {activeTab === "group-sessions" && (
              <section className="mb-6">
                <BatchGroupSessionsPanel batchId={batchId} />
              </section>
            )}
            {activeTab === "attendance" && (
              <section className="mb-6">
                <BatchAttendancePanel batchId={batchId} />
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
