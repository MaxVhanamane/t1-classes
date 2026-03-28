import Image from "next/image";
import { Link } from "@/src/components/ui/link";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ExploreCourse } from "@/src/app/api/explore-batches/types";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { formatPriceWithComma } from "@/src/lib/helper-functions/format-price-with-comma";

export function ExploreCourseCard({
  course,
  context = "default",
}: {
  course: ExploreCourse;
  context?: "default" | "batch";
}) {
  const isBatchContext = context === "batch";
  const discount =
    course.list_price && course.list_price > course.sale_price
      ? Math.round(
          ((course.list_price - course.sale_price) / course.list_price) * 100,
        )
      : null;
  return (
    <Card className="flex h-115 flex-col overflow-hidden p-0 transition hover:shadow-md relative gap-3 group">
      {/* Image */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden shrink-0">
        {course.thumbnail_image ? (
          <Image
            src={`${R2_BUCKET_PUBLIC_URL}/${course.thumbnail_image}`}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-0 relative overflow-hidden">
        {/* Title */}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          {course.title}
        </h3>

        {/* Subtitle */}
        {course.subtitle && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.subtitle}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-1 max-h-7 overflow-hidden">
          {course.class_level && (
            <Badge variant="outline" className="text-xs">
              Class {course.class_level}
            </Badge>
          )}

          {course.target_exam && (
            <p
              className="
    text-xs
    border
    rounded-full
    px-2
    py-0.5
    max-w-35
    truncate
    overflow-hidden
    whitespace-nowrap
    text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground
  "
            >
              {course.target_exam}
            </p>
          )}

          {/* Subjects (limit 2) */}
          {course.subjects?.slice(0, 3).map((sub) => (
            <Badge key={sub} variant="secondary" className="text-xs">
              {sub}
            </Badge>
          ))}

          {/* Course Type Badge Overlay */}
          {course.course_type && (
            <Badge className="text-xs capitalize">{course.course_type}</Badge>
          )}
        </div>
        <div className="flex-1" />
        {/* Price */}
        {isBatchContext ? (
          <div className="flex items-center gap-2">
            {course.sale_price > 0 && (
              <span className="text-muted-foreground line-through text-sm">
                ₹{formatPriceWithComma(course.sale_price)}
              </span>
            )}
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
              Free with Batch
            </span>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold">
                {course.sale_price === 0
                  ? "Free"
                  : `₹${formatPriceWithComma(course.sale_price)}`}
              </span>

              {course.list_price &&
                course.list_price !== course.sale_price &&
                course.sale_price !== 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{formatPriceWithComma(course.list_price)}
                  </span>
                )}
            </div>
            {discount && course.sale_price !== 0 && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                {discount}% OFF
              </span>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 pb-4 shrink-0 ">
        <Button
          asChild
          variant={isBatchContext ? "outline" : "default"}
          className="w-full"
        >
          <Link href={`/courses/${course.slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
