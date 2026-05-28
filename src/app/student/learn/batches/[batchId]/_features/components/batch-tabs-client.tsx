"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function TabSlide({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-[0_0_100%] overflow-hidden bg-background">
      <div className="px-0.5">
        <div className="min-h-[80px]">{children}</div>
      </div>
    </div>
  );
}

export default function BatchTabsClient({ batchId, courses }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("courses");

  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",

    // faster/snappier
    duration: 0,

    containScroll: "trimSnaps",

    watchDrag: true,

    dragFree: false,

    skipSnaps: false,
  });

  const selectedIndex = tabs.findIndex((tab) => tab.key === activeTab);

  const handleSelectTab = useCallback(
    (index: number) => {
      const tab = tabs[index];

      if (!tab) return;

      setActiveTab(tab.key);

      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    const index = emblaApi.selectedScrollSnap();

    const tab = tabs[index];

    if (!tab) return;

    setActiveTab(tab.key);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

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
          className="
    flex gap-2 overflow-x-auto pb-1
    [-ms-overflow-style:none]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden
  "
        >
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              active={selectedIndex === index}
              data-active={selectedIndex === index}
              onClick={() => handleSelectTab(index)}
            />
          ))}
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden touch-pan-y">
        <div className="flex">
          <TabSlide>
            {activeTab === "courses" && (
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
          </TabSlide>

          <TabSlide>
            {activeTab === "tests" && (
              <section>
                <BatchTestsPanel batchId={batchId} />
              </section>
            )}
          </TabSlide>

          <TabSlide>
            {activeTab === "live-classes" && (
              <section>
                <BatchLiveClassesPanel batchId={batchId} />
              </section>
            )}
          </TabSlide>

          <TabSlide>
            {activeTab === "mentorship" && (
              <section>
                <BatchMentorshipSessionsPanel batchId={batchId} />
              </section>
            )}
          </TabSlide>

          <TabSlide>
            {activeTab === "group-sessions" && (
              <section>
                <BatchGroupSessionsPanel batchId={batchId} />
              </section>
            )}
          </TabSlide>
        </div>
      </div>
    </>
  );
}
