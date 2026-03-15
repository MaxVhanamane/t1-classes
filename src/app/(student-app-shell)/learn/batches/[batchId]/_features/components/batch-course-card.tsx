import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { BatchCourse } from "@/src/types/batches.types";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";

interface CourseCardProps {
  course: BatchCourse;
  batchId?: string;
}

export function CourseCard({ course, batchId }: CourseCardProps) {
  const visibleSubjects = course.subjects?.slice(0, 3) ?? [];
  const hiddenSubjects = course.subjects?.slice(3) ?? [];

  return (
    <Card className="flex h-110 flex-col overflow-hidden bg-background gap-0 p-0">
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={`${R2_BUCKET_PUBLIC_URL}/${course.thumbnail_image}`}
          alt={course.title}
          fill
          priority={false}
          className="object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-muted/80 to-transparent" />

        <Badge
          variant="secondary"
          className="absolute left-3 top-3 bg-background/90 text-[10px] capitalize"
        >
          {course.course_type}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-0 ">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight">
          {course.title}
        </h3>

        {/* Subtitle */}
        {course.subtitle && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.subtitle}
          </p>
        )}
        {(course.target_exam || course.class_level) && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            {course.target_exam && (
              <p className="line-clamp-1">
                <span className="font-medium text-foreground/80">
                  Target Exam:{" "}
                </span>
                {course.target_exam}
              </p>
            )}

            {course.class_level && (
              <p>
                <span className="font-medium text-foreground/80">
                  Class Level:{" "}
                </span>
                {course.class_level}
              </p>
            )}
          </div>
        )}

        {course.subjects && course.subjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {visibleSubjects.map((subject) => (
              <Badge
                key={subject}
                variant="outline"
                className="rounded-sm px-2 py-0.5 text-[10px]"
              >
                {subject}
              </Badge>
            ))}

            {hiddenSubjects.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="rounded-sm border border-dashed px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    +{hiddenSubjects.length} more
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="center"
                  className="w-auto max-w-60 rounded-lg border bg-background p-3 shadow-md"
                >
                  <div className="flex flex-wrap justify-center gap-1">
                    {hiddenSubjects.map((subject) => (
                      <Badge
                        key={subject}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {course.subtitle && (
          <p className="line-clamp-5 text-xs leading-relaxed text-muted-foreground">
            {course.subtitle}
          </p>
        )}
        <div className="flex-1" />
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 ">
        <Button asChild className="w-full">
          <Link
            href={
              batchId
                ? `/learn/courses/${course.slug}?batchId=${batchId}`
                : `/learn/course/${course.slug}`
            }
          >
            Open course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
