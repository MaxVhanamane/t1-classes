import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { CourseEnrollment } from "../types";
import { formatDateShort } from "@/src/lib/date";

interface Props {
  enrollment: CourseEnrollment;
}

export function CourseEnrollmentCard({ enrollment }: Props) {
  const { course, accessEndsAt } = enrollment;

  return (
    <Card className="flex h-72 flex-col transition hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[1.05rem] font-semibold leading-snug">
            {course.title}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 px-2 py-0.5 text-[10px]"
          >
            Course
          </Badge>
        </div>

        {/* Meta */}
        <p className="text-xs capitalize text-muted-foreground">
          {course.courseType}
        </p>

        {/* Context */}
        <p className="text-sm text-muted-foreground">
          Continue learning where you left off.
        </p>

        {/* Access */}
        {accessEndsAt && (
          <p className="text-xs text-muted-foreground">
            Access till {formatDateShort(accessEndsAt)}
          </p>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-2">
        <Button asChild className="w-full">
          <Link href={`/course/${course.slug}`}>Continue Learning</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
