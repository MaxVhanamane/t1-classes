"use client";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useRouter } from "nextjs-toploader/app";
import { CourseRow } from "../actions/courses.actions";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { TableThumbnailPreview } from "./Table-thumbnail-preview";
import { TitleSubtitleTooltip } from "@/src/components/ui/common/title-subtitle-tooltip";

interface CoursesTableProps {
  data: CourseRow[];
  onEdit: (course: CourseRow) => void;
}

export function CoursesTable({ data, onEdit }: CoursesTableProps) {
  const router = useRouter();

  return (
    <TooltipProvider>
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Target Exam</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Outcomes</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((course) => {
              const thumbnailSrc = course.thumbnail_image
                ? `${R2_BUCKET_PUBLIC_URL}/${course.thumbnail_image}`
                : null;

              return (
                <TableRow key={course.id}>
                  {/* Thumbnail */}
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-visible rounded-md border">
                      <TableThumbnailPreview
                        src={thumbnailSrc}
                        title={course.title}
                        enableHoverPreview
                        onFix={() => onEdit(course)}
                      />
                    </div>
                  </TableCell>

                  {/* Title */}
                  <TableCell className="font-medium">
                    {course.title ? (
                      <TitleSubtitleTooltip
                        title={course.title}
                        subtitle={course.subtitle}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Type */}
                  <TableCell className="capitalize">
                    {course.course_type ?? "—"}
                  </TableCell>

                  {/* Class */}
                  <TableCell>
                    {course.class_level ? `Class ${course.class_level}` : "—"}
                  </TableCell>

                  {/* Target Exam */}
                  <TableCell>{course.target_exam ?? "—"}</TableCell>

                  {/* Board (Tooltip if long) */}
                  <TableCell>
                    {course.board ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-30 inline-block cursor-help">
                            {course.board}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent align="start">
                          {course.board}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Languages */}
                  <TableCell>
                    {course.languages?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {course.languages.slice(0, 2).join(", ")}
                            {course.languages.length > 2 &&
                              ` +${course.languages.length - 2}`}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {course.languages.join(", ")}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Subjects */}
                  <TableCell>
                    {course.subjects?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {course.subjects.length}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent align="start">
                          <ul className="list-disc pl-4 space-y-1">
                            {course.subjects.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Outcomes */}
                  <TableCell>
                    {course.learning_outcomes?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {course.learning_outcomes.length}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent align="start">
                          <ul className="list-disc pl-4 space-y-1">
                            {course.learning_outcomes.map((o) => (
                              <li key={o}>{o}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Audience */}
                  <TableCell>
                    {course.target_audience?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {course.target_audience.length}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent align="start">
                          <ul className="list-disc pl-4 space-y-1">
                            {course.target_audience.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    {course.sale_price ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ₹{course.sale_price}
                        </span>

                        {course.list_price > course.sale_price && (
                          <>
                            <span className="text-xs line-through text-muted-foreground">
                              ₹{course.list_price}
                            </span>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {Math.round(
                                ((course.list_price - course.sale_price) /
                                  course.list_price) *
                                  100,
                              )}
                              % off
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(course)}
                      >
                        Edit
                      </Button>
                      <Button
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
                  colSpan={13}
                  className="text-center text-muted-foreground"
                >
                  No courses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
