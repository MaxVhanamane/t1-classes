"use client";

import { useCallback, useEffect, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";

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

  // track which tabs were visited
  const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(
    () => new Set(["courses"]),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    dragFree: false,
    containScroll: "trimSnaps",
    watchDrag: true,
  });

  const selectedIndex = tabs.findIndex((tab) => tab.key === activeTab);

  const markTabAsVisited = useCallback((tabKey: TabKey) => {
    setVisitedTabs((prev) => {
      if (prev.has(tabKey)) return prev;

      const next = new Set(prev);

      next.add(tabKey);

      return next;
    });
  }, []);

  const handleSelectTab = useCallback(
    (index: number) => {
      const tab = tabs[index];

      if (!tab) return;

      setActiveTab(tab.key);

      markTabAsVisited(tab.key);

      emblaApi?.scrollTo(index);
    },
    [emblaApi, markTabAsVisited],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    const index = emblaApi.selectedScrollSnap();

    const tab = tabs[index];

    if (!tab) return;

    setActiveTab(tab.key);

    markTabAsVisited(tab.key);
  }, [emblaApi, markTabAsVisited]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <>
      <div className="mb-6 border-b">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              active={selectedIndex === index}
              onClick={() => handleSelectTab(index)}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          <div className="min-w-0 flex-[0_0_100%]">
            {visitedTabs.has("courses") && (
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    batchId={batchId}
                  />
                ))}
              </section>
            )}
          </div>

          <div className="min-w-0 flex-[0_0_100%]">
            {visitedTabs.has("tests") && (
              <section>
                <BatchTestsPanel batchId={batchId} />
              </section>
            )}
          </div>

          <div className="min-w-0 flex-[0_0_100%]">
            {visitedTabs.has("live-classes") && (
              <section>
                <BatchLiveClassesPanel batchId={batchId} />
              </section>
            )}
          </div>

          <div className="min-w-0 flex-[0_0_100%]">
            {visitedTabs.has("mentorship") && (
              <section>
                <BatchMentorshipSessionsPanel batchId={batchId} />
              </section>
            )}
          </div>

          <div className="min-w-0 flex-[0_0_100%]">
            {visitedTabs.has("group-sessions") && (
              <section>
                <BatchGroupSessionsPanel batchId={batchId} />
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
