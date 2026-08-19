import { Link } from "@/src/components/ui/link";
import Image from "next/image";

import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { BatchCourse } from "@/src/types/batches.types";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { BookOpen, GraduationCap, Languages } from "lucide-react";

interface CourseCardProps {
  course: BatchCourse;
  batchId?: string;
}

export function CourseCard({ course, batchId }: CourseCardProps) {
  // 1. Format the category to be Title Case (e.g., "competitive" -> "Competitive")
  const categoryText = course.category
    ? course.category.charAt(0).toUpperCase() +
      course.category.slice(1).replace(/_/g, " ")
    : "";

  // 2. Prepend the category to the academic context
  const academicContext =
    course.category === "boards" && course.class_level && course.board
      ? `${categoryText} • Class ${course.class_level} • ${course.board.toUpperCase().replace(/_/g, " ")}`
      : course.target_exam
        ? `${categoryText} • ${course.target_exam.toUpperCase().replace(/_/g, " ")}`
        : categoryText;

  return (
    <Card className="flex h-110 flex-col overflow-hidden bg-background gap-0 p-0">
      {/* Top Image Section */}
      <div className="px-3 pt-3">
        <div className="relative aspect-video w-full bg-muted overflow-hidden shrink-0 rounded-md">
          <Image
            src={`${R2_BUCKET_PUBLIC_URL}/${course.thumbnail_image}`}
            alt={course.title}
            fill
            priority={false}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-muted/80 to-transparent" />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight">
          {course.title}
        </h3>

        {/* Sleek Icon-Based Metadata Grid */}
        <div className="mt-1 flex flex-col gap-2.5">
          {/* Academic Context with Category Integrated */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <GraduationCap className="size-3.5 shrink-0 text-muted-foreground" />
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
              <Languages className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="capitalize line-clamp-1">
                {course.languages.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Spacer to dynamically push footer down */}
        <div className="flex-1" />
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <Button asChild className="w-full">
          <Link
            href={
              batchId
                ? `/student/learn/courses/${course.slug}?batchId=${batchId}`
                : `/student/learn/courses/${course.slug}`
            }
          >
            Open course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
