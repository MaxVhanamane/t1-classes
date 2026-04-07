import { Link } from "@/src/components/ui/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { CourseEnrollment } from "../../../../../../api/my-enrollments/types";
import { formatDateShort } from "@/src/lib/date";
import { GrafanaBackground } from "@/src/components/ui/grafana-background";

interface Props {
  enrollment: CourseEnrollment;
}

export function CourseEnrollmentCard({ enrollment }: Props) {
  const { course, accessEndsAt } = enrollment;

  return (
    <Card className="relative overflow-hidden flex h-72 flex-col py-5 rounded-xl transition hover:shadow-lg bg-background ">
      {/*  Subtle top light (main effect) */}
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

      {/*  Hover enhancement (very subtle) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition duration-500 
    group-hover:opacity-100 
    bg-linear-to-b from-violet-400/10 to-transparent"
      />

      {/*  Content */}
      <CardContent className="relative z-10 flex flex-1 flex-col gap-3 px-4 py-2 overflow-hidden">
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
          {course.category}
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
