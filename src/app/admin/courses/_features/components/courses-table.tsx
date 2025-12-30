"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Course } from "../actions/actions";
import { useRouter } from "nextjs-toploader/app";

//  Thumbnail Component (Single Source of Truth)

function CourseThumbnail({
  src,
  title,
  onFix,
  enableHoverPreview = false,
}: {
  src?: string | null;
  title: string;
  onFix?: () => void;
  enableHoverPreview?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // No thumbnail configured
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
        —
      </div>
    );
  }

  // Thumbnail configured but broken
  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-destructive/10 text-[10px] text-destructive">
        <span>Broken image</span>
        {onFix && (
          <button
            type="button"
            onClick={onFix}
            className="text-[10px] underline hover:opacity-80"
          >
            Fix thumbnail
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => enableHoverPreview && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt={title}
        fill
        sizes="(max-width: 768px) 64px, 40px"
        className="object-cover"
        onError={() => setFailed(true)}
      />

      {/* Desktop hover preview */}
      {enableHoverPreview && hovered && (
        <div className="absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 md:block">
          <div className="relative h-32 w-32 overflow-hidden rounded-md border bg-background shadow-lg">
            <Image
              src={src}
              alt={title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Courses Table

interface CoursesTableProps {
  data: Course[];
  onEdit: (course: Course) => void;
}

export function CoursesTable({ data, onEdit }: CoursesTableProps) {
  const router = useRouter();
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Class / Exam</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((course) => {
              const classOrExam =
                course.course_type === "academic" ||
                course.course_type === "foundation"
                  ? course.class_level
                    ? `Class ${course.class_level}`
                    : "—"
                  : course.target_exam ?? "—";

              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-visible rounded-md border">
                      <CourseThumbnail
                        src={course.thumbnail_image}
                        title={course.title}
                        enableHoverPreview
                        onFix={() => onEdit(course)}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{course.title}</TableCell>

                  <TableCell className="capitalize">
                    {course.course_type}
                  </TableCell>

                  <TableCell>{classOrExam}</TableCell>

                  <TableCell>
                    {course.subjects?.length ? course.subjects.join(", ") : "—"}
                  </TableCell>

                  <TableCell>
                    {course.price !== null && course.price !== undefined
                      ? `₹${course.price}`
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right ">
                    <div className="flex items-center gap-2">
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(course)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/curriculum/${course.id}`)
                        }
                      >
                        Curriculum
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {!data.length && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No courses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {data.map((course) => {
          const classOrExam =
            course.course_type === "academic" ||
            course.course_type === "foundation"
              ? course.class_level
                ? `Class ${course.class_level}`
                : "—"
              : course.target_exam ?? "—";

          return (
            <div key={course.id} className="rounded-lg border p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                  <CourseThumbnail
                    src={course.thumbnail_image}
                    title={course.title}
                    onFix={() => onEdit(course)}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight truncate">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {course.course_type}
                  </p>
                </div>

                <Badge
                  variant={course.is_active ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {course.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Details */}
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium text-foreground">
                    Class / Exam:{" "}
                  </span>
                  {classOrExam}
                </div>

                <div>
                  <span className="font-medium text-foreground">
                    Subjects:{" "}
                  </span>
                  {course.subjects?.length ? course.subjects.join(", ") : "—"}
                </div>

                <div>
                  <span className="font-medium text-foreground">Price: </span>
                  {course.price !== null && course.price !== undefined
                    ? `₹${course.price}`
                    : "—"}
                </div>
              </div>

              {/* Action */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(course)}
                >
                  Edit Course
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/curriculum/${course.id}`)}
                >
                  Curriculum
                </Button>
              </div>
            </div>
          );
        })}

        {!data.length && (
          <div className="text-center text-muted-foreground text-sm">
            No courses found
          </div>
        )}
      </div>
    </>
  );
}
