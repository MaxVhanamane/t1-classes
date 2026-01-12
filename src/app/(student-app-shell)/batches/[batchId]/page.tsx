import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Info } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { BatchMetaBadges } from "@/src/components/ui/common/batch-meta-badges";
import { CourseCard } from "./_features/components/batch-course-card";
import { BatchDetailsResponse } from "@/src/types/batches.types";

type Props = {
  params: Promise<{ batchId: string }>;
};

export default async function BatchPage({ params }: Props) {
  const { batchId } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/batches/${batchId}`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore.toString(),
      },
    }
  );

  if (!res.ok) {
    notFound();
  }

  const data: BatchDetailsResponse = await res.json();
  const { batch, courses } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        {/* =====================================================
         * Batch Header (Compact, Premium)
         * =================================================== */}
        <header className="mb-6 space-y-3">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {batch.name}
            </h1>

            {/* Info Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                >
                  <Info className="h-5 w-5" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-72 space-y-3 bg-card">
                {batch.description && (
                  <p className="text-sm text-muted-foreground">
                    {batch.description}
                  </p>
                )}

                <div className="space-y-1 text-xs text-muted-foreground">
                  {batch.startDate && <p>Start date: {batch.startDate}</p>}
                  {batch.endDate && <p>End date: {batch.endDate}</p>}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Badges */}
          <BatchMetaBadges mode={batch.mode} status={batch.status} size="md" />
        </header>

        {/* =====================================================
         * Tabs
         * =================================================== */}
        <div className="mb-6 border-b">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium text-foreground"
              >
                Courses
              </Button>
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled
            >
              Tests
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled
            >
              Announcements
            </Button>
          </div>
        </div>

        {/* =====================================================
         * Courses Grid
         * =================================================== */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} batchId={batch.id} />
          ))}
        </section>
      </div>
    </div>
  );
}
