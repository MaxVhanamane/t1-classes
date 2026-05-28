"use client";

import { useRef, useState } from "react";

import { Button } from "@/src/components/ui/button";

import { CourseCard } from "./batch-course-card";

import BatchTestsPanel from "./batch-tests-panel";
import BatchLiveClassesPanel from "./batch-live-classes-panel";
import BatchMentorshipSessionsPanel from "./batch-mentorship-sessions-panel";
import BatchGroupSessionsPanel from "./batch-group-sessions-panel";

import { BatchDetailsResponse } from "@/src/types/batches.types";

type TabKey =
  | "courses"
  | "tests"
  | "live-classes"
  | "mentorship"
  | "group-sessions";

const tabs: TabKey[] = [
  "courses",
  "tests",
  "live-classes",
  "mentorship",
  "group-sessions",
];

type Props = {
  batchId: string;
  courses: BatchDetailsResponse["courses"];
};

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="relative shrink-0">
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

export default function BatchTabsClient({ batchId, courses }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("courses");

  const startX = useRef(0);
  const startY = useRef(0);
  const isPointerDown = useRef(false);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // only handle touch gestures
    if (e.pointerType !== "touch") return;

    isPointerDown.current = true;

    startX.current = e.clientX;
    startY.current = e.clientY;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isPointerDown.current) return;

    isPointerDown.current = false;

    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    // ignore vertical scroll gestures
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // minimum swipe distance
    if (Math.abs(deltaX) < 60) return;

    const currentIndex = tabs.indexOf(activeTab);

    // swipe left → next tab
    if (deltaX < 0 && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }

    // swipe right → previous tab
    if (deltaX > 0 && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  }

  return (
    <>
      <div className="mb-6 border-b">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <TabButton
            label="Courses"
            active={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
          />

          <TabButton
            label="Tests"
            active={activeTab === "tests"}
            onClick={() => setActiveTab("tests")}
          />

          <TabButton
            label="Live Classes"
            active={activeTab === "live-classes"}
            onClick={() => setActiveTab("live-classes")}
          />

          <TabButton
            label="Mentorship"
            active={activeTab === "mentorship"}
            onClick={() => setActiveTab("mentorship")}
          />

          <TabButton
            label="Group Sessions"
            active={activeTab === "group-sessions"}
            onClick={() => setActiveTab("group-sessions")}
          />
        </div>
      </div>

      <div
        className="touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {activeTab === "courses" && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} batchId={batchId} />
            ))}
          </section>
        )}

        {activeTab === "tests" && (
          <section>
            <BatchTestsPanel batchId={batchId} />
          </section>
        )}

        {activeTab === "live-classes" && (
          <section>
            <BatchLiveClassesPanel batchId={batchId} />
          </section>
        )}

        {activeTab === "mentorship" && (
          <section>
            <BatchMentorshipSessionsPanel batchId={batchId} />
          </section>
        )}

        {activeTab === "group-sessions" && (
          <section>
            <BatchGroupSessionsPanel batchId={batchId} />
          </section>
        )}
      </div>
    </>
  );
}
