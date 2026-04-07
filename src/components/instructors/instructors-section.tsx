"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { CourseInstructorType } from "@/src/app/api/course-instructors/[courseId]/route";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { SectionDivider } from "@/src/components/ui/section-divider";

type Props = {
  id: string;
  type: "course" | "batch";
};

async function fetchInstructors(id: string, type: "course" | "batch") {
  const endpoint =
    type === "course"
      ? `/api/course-instructors/${id}`
      : `/api/batch-instructors/${id}`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error("Failed to fetch instructors");
  }

  return res.json();
}

export function InstructorsSection({ id, type }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["instructors", type, id],
    queryFn: () => fetchInstructors(id, type),
    enabled: !!id,
  });

  if (!id) return null;
  const instructors = data ?? [];
  if (!isLoading && !isError && instructors.length === 0) {
    return null;
  }

  return (
    <>
      <SectionDivider />

      <section className="space-y-6 mb-6">
        <h2 className="text-2xl font-semibold">Meet Your Instructors</h2>

        {isLoading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card p-6 animate-pulse  min-h-114"
              >
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 rounded-full bg-muted shrink-0" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-40 bg-muted rounded" />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                  <div className="h-3 w-4/6 bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                  <div className="h-3 w-4/6 bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                  <div className="h-3 w-4/6 bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to load instructors.
          </p>
        )}

        {data && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((instructor: CourseInstructorType) => (
              <article
                key={instructor.id}
                className="rounded-xl border bg-card p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm max-h-114"
              >
                <div className="flex items-start gap-5">
                  {instructor.profile_image && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                      <Image
                        src={`${R2_BUCKET_PUBLIC_URL}/${instructor.profile_image}`}
                        alt={instructor.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <h3
                      className="text-lg font-semibold truncate"
                      title={instructor.full_name}
                    >
                      {instructor.full_name}
                    </h3>

                    {instructor.qualification && (
                      <p
                        className="text-sm text-muted-foreground line-clamp-2"
                        title={instructor.qualification}
                      >
                        {instructor.qualification}
                      </p>
                    )}
                  </div>
                </div>

                {instructor.bio && (
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {instructor.bio}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
