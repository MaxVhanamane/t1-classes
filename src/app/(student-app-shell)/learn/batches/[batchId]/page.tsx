import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/src/components/ui/button";

import { BatchMetaBadges } from "@/src/components/ui/common/batch-meta-badges";
import { CourseCard } from "./_features/components/batch-course-card";

import { BatchDetailsResponse } from "@/src/types/batches.types";
import BatchTestsPanel from "./_features/components/batch-tests-panel";
import { BatchInfoPopover } from "./_features/components/batch-info-popover";

type Props = {
  params: Promise<{ batchId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function BatchPage({ params, searchParams }: Props) {
  const { batchId } = await params;
  const { tab } = await searchParams;

  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/batches/${batchId}`,
    {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  );

  if (!res.ok) {
    notFound();
  }

  const data: BatchDetailsResponse = await res.json();

  const { batch, courses } = data;

  const activeTab = tab === "tests" ? "tests" : "courses";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        {/* ===================================================== */}
        {/* Batch Header */}
        {/* ===================================================== */}
        <header className="mb-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {batch.title}
            </h1>
            <BatchInfoPopover
              start_date={batch.start_date}
              end_date={batch.end_date}
            />
          </div>

          <BatchMetaBadges batch={{ ...batch }} />
        </header>

        {/* ===================================================== */}
        {/* Tabs */}
        {/* ===================================================== */}
        <div className="mb-6 border-b">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <a
              href={`/learn/batches/${batchId}?tab=courses`}
              className="relative"
            >
              <Button
                variant="ghost"
                size="sm"
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
            </a>

            <a
              href={`/learn/batches/${batchId}?tab=tests`}
              className="relative"
            >
              <Button
                variant="ghost"
                size="sm"
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
            </a>
          </div>
        </div>

        {/* ===================================================== */}
        {/* Tab Content */}
        {/* ===================================================== */}
        {activeTab === "courses" && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} batchId={batch.id} />
            ))}
          </section>
        )}

        {activeTab === "tests" && (
          <section>
            <BatchTestsPanel batchId={batch.id} />
          </section>
        )}
      </div>
    </div>
  );
}
