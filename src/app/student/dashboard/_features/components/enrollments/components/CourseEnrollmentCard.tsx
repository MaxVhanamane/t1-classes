import { Link } from "@/src/components/ui/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { CourseEnrollment } from "../../../../../../../lib/services/enrollments/types";
import { formatDateShort } from "@/src/lib/date";
import { GrafanaBackground } from "@/src/components/ui/grafana-background";
import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  Languages,
} from "lucide-react";

interface Props {
  enrollment: CourseEnrollment;
}

export function CourseEnrollmentCard({ enrollment }: Props) {
  const { course, accessEndsAt } = enrollment;

  // Format the academic context based on the category
  const academicContext =
    course.category === "boards" && course.class_level && course.board
      ? `Class ${course.class_level} • ${course.board.toUpperCase().replace("_", " ")}`
      : course.target_exam
        ? course.target_exam.toUpperCase().replace("_", " ")
        : course.category.toUpperCase().replace("_", " ");

  return (
    <Card className="relative overflow-hidden flex h-74 flex-col py-3 rounded-xl transition bg-background group">
      {/* Subtle top light (main effect) */}
      <GrafanaBackground opacity={0.5} />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 
    bg-linear-to-b from-violet-400/60 via-violet-400/5 to-transparent 
    dark:from-violet-400/60 dark:via-violet-300/5 blur-2xl"
      />

      {/* Soft border glow (NO animation) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset 
    ring-violet-400/10 dark:ring-violet-300/15"
      />

      {/* Content */}
      <CardContent className="relative z-10 flex flex-1 flex-col gap-3 px-4 py-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[1.05rem] font-semibold leading-snug">
            {course.title}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 px-2 py-0.5 text-[10px] bg-background/70 dark:bg-white/10 backdrop-blur-md"
          >
            Course
          </Badge>
        </div>

        {/* Course Metadata Grid (pushed to bottom) */}
        <div className="mt-2 flex flex-col gap-2.5">
          {/* Academic Context */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <GraduationCap className="size-3.5 text-muted-foreground" />
            <span className="truncate">{academicContext}</span>
          </div>

          {/* Subjects */}
          {course.subjects && course.subjects.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <BookOpen className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="line-clamp-1 capitalize">
                {course.subjects.join(", ").replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Languages */}
          {course.languages && course.languages.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Languages className="size-3.5 text-muted-foreground" />
              <span className="capitalize">{course.languages.join(", ")}</span>
            </div>
          )}

          {/* Access Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5 text-muted-foreground" />
            <span>
              {accessEndsAt
                ? `Access till ${formatDateShort(accessEndsAt)}`
                : "Lifetime access"}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="relative z-10 px-4">
        <Button asChild className="w-full">
          <Link href={`/student/learn/courses/${course.slug}`}>
            Continue Learning
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
