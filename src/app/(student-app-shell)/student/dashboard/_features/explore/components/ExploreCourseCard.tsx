import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ExploreCourse } from "@/src/app/api/explore-batches/types";

export function ExploreCourseCard({ course }: { course: ExploreCourse }) {
  return (
    <Card className="flex h-120 flex-col overflow-hidden p-0 transition hover:shadow-md relative">
      {/* Image MUST be first child and card must be p-0 */}
      <div className="relative aspect-video w-full bg-background">
        {course.thumbnail_image && (
          <Image
            src={course.thumbnail_image}
            alt={course.title}
            fill
            priority={false}
            className="object-cover"
          />
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-2 px-4 ">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          {course.title}
        </h3>

        {course.description && (
          <p className="line-clamp-5 text-sm text-muted-foreground">
            {course.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {course.class_level && (
            <Badge variant="outline" className="text-xs">
              Class {course.class_level}
            </Badge>
          )}
          {course.target_exam && (
            <Badge variant="outline" className="text-xs">
              {course.target_exam}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 pb-6 ">
        <Button asChild className="w-full">
          <Link href={`/courses/${course.slug}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
