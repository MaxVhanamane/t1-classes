import Image from "next/image";
import { Badge } from "@/src/components/ui/badge";
import { CourseDetails } from "../types/course-details.types";

type Props = {
  course: CourseDetails;
};

export function CourseHero({ course }: Props) {
  return (
    <section className="grid gap-6 lg:grid-cols-2 items-start">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
        {course.thumbnailImage && (
          <Image
            src={course.thumbnailImage}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold leading-snug">
            {course.title}
          </h1>

          {course.description && (
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {course.courseType}
          </Badge>

          {course.targetExam && (
            <Badge variant="outline">{course.targetExam}</Badge>
          )}
        </div>
      </div>
    </section>
  );
}
