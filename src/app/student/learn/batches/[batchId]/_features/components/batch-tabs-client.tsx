"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { CourseCard } from "./batch-course-card";
import BatchTestsPanel from "./batch-tests-panel";
import { BatchDetailsResponse } from "@/src/types/batches.types";

type Props = {
  batchId: string;
  courses: BatchDetailsResponse["courses"];
};

export default function BatchTabsClient({ batchId, courses }: Props) {
  const [activeTab, setActiveTab] = useState<"courses" | "tests">("courses");

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* Courses Tab */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("courses")}
              className={
                activeTab === "courses"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              Courses
            </Button>

            {activeTab === "courses" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
            )}
          </div>

          {/* Tests Tab */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("tests")}
              className={
                activeTab === "tests"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              Tests
            </Button>

            {activeTab === "tests" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
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
    </>
  );
}
