"use client";

import { useState } from "react";

import { Button } from "@/src/components/ui/button";

import { CourseCard } from "./batch-course-card";
import BatchTestsPanel from "./batch-tests-panel";

import { BatchDetailsResponse } from "@/src/types/batches.types";
import BatchLiveClassesPanel from "./batch-live-classes-panel";
import BatchMentorshipSessionsPanel from "./batch-mentorship-sessions-panel";

type TabKey = "courses" | "tests" | "live-classes" | "mentorship";

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
        </div>
      </div>

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
    </>
  );
}
