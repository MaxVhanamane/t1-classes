"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { SquarePen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { LifecycleBadge, ModeBadge } from "./batch-badges";
import { BatchListItem } from "../types/types";
import { BatchActiveSwitch } from "./batch-active-switch";
import { Badge } from "@/src/components/ui/badge";
import { CATEGORY_LABELS, BOARD_LABELS } from "../zod-schema/schema";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { RichTextRenderer } from "../../../tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-renderer";
import { TableThumbnailPreview } from "../../../courses/_features/components/Table-thumbnail-preview";
import { TitleSubtitleTooltip } from "@/src/components/ui/common/title-subtitle-tooltip";
import { format } from "date-fns";

type Props = {
  batches: BatchListItem[];
  onEdit: (batch: BatchListItem) => void;
};

export function BatchesTable({ batches, onEdit }: Props) {
  return (
    <TooltipProvider>
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-muted-soft">
                Thumbnail
              </TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Admission</TableHead>
              <TableHead className="text-center">Mode</TableHead>
              <TableHead className="text-center">Lifecycle</TableHead>
              <TableHead className="text-center">Capacity</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Outcomes</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {batches.map((batch) => {
              const thumbnailSrc = batch.thumbnail_image
                ? `${R2_BUCKET_PUBLIC_URL}/${batch.thumbnail_image}`
                : null;

              return (
                <TableRow key={batch.id} className="group">
                  {/* ---------------------------------- */}
                  {/* Thumbnail */}
                  {/* ---------------------------------- */}
                  <TableCell className="sticky left-0 z-20 font-medium bg-muted-soft after:absolute after:inset-0 after:bg-muted/50 after:opacity-0 after:content-[''] after:transition-opacity group-hover:after:opacity-100">
                    <div className="relative h-10 w-10 z-20 overflow-visible rounded-md border">
                      <TableThumbnailPreview
                        src={thumbnailSrc}
                        title={batch.title}
                        enableHoverPreview
                      />
                    </div>
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Name + Subtitle */}
                  {/* ---------------------------------- */}
                  <TableCell className="font-medium">
                    {batch.title ? (
                      <TitleSubtitleTooltip
                        title={batch.title}
                        subtitle={batch.subtitle}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col text-xs leading-tight">
                      <div>
                        <span className="text-muted-foreground">Start:</span>{" "}
                        {format(batch.start_date, "dd MMM yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">End:</span>{" "}
                        {format(batch.end_date, "dd MMM yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  {/* category */}
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[batch.category] ?? batch.category}
                    </Badge>
                  </TableCell>
                  {/* Board  */}
                  <TableCell>
                    {batch.category === "boards" && batch.board ? (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <p className="max-w-30 truncate cursor-help">
                            {BOARD_LABELS[batch.board]}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {BOARD_LABELS[batch.board]}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {/* Class Level  */}
                  <TableCell>
                    <Badge variant="outline">{batch.class_level}</Badge>
                  </TableCell>
                  {/* ---------------------------------- */}
                  {/* Description (TipTap JSON) */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    {batch.description ? (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <div className="cursor-help max-w-xs">
                            <RichTextRenderer
                              content={batch.description}
                              className="line-clamp-1"
                            />
                          </div>
                        </TooltipTrigger>

                        <TooltipContent align="start" className="max-w-md ">
                          <div className="max-h-64 overflow-y-auto pr-2">
                            <RichTextRenderer
                              content={batch.description}
                              variant="prose"
                              className="text-white! dark:text-gray-900!"
                            />
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Courses */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    {batch.courses.length === 0 ? (
                      <span className="text-xs text-destructive font-medium">
                        No courses
                      </span>
                    ) : batch.courses.length === 1 ? (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <p className="max-w-55 truncate cursor-help">
                            {batch.courses[0].course.title}
                          </p>
                        </TooltipTrigger>

                        <TooltipContent align="start" className="max-w-xs">
                          {batch.courses[0].course.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="underline cursor-help">
                            {batch.courses.length} courses
                          </span>
                        </TooltipTrigger>

                        <TooltipContent align="start">
                          <ul className="space-y-1">
                            {batch.courses.map(({ course }) => (
                              <li key={course.id}>• {course.title}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Price + Discount */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Sale Price */}
                      <span className="font-semibold text-base">
                        ₹{batch.sale_price}
                      </span>

                      {/* List Price (only if discounted) */}
                      {batch.list_price > batch.sale_price && (
                        <>
                          <span className="text-xs line-through text-muted-foreground">
                            ₹{batch.list_price}
                          </span>

                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {Math.round(
                              ((batch.list_price - batch.sale_price) /
                                batch.list_price) *
                                100,
                            )}
                            % off
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Location */}
                  {/* ---------------------------------- */}
                  <TableCell className="capitalize">
                    {batch.location ?? "—"}
                  </TableCell>

                  <TableCell>
                    {batch.address ? (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <p className="max-w-45 truncate cursor-help">
                            {batch.address}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent align="start" className="max-w-xs">
                          {batch.address}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Languages */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    {batch.languages?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {batch.languages[0]}
                            {batch.languages.length > 1 &&
                              ` +${batch.languages.length - 1}`}
                          </Badge>
                        </TooltipTrigger>

                        <TooltipContent>
                          {batch.languages.join(", ")}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Admission */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    <Badge
                      variant={
                        batch.is_admission_open ? "outline" : "secondary"
                      }
                    >
                      {batch.is_admission_open ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Mode */}
                  {/* ---------------------------------- */}
                  <TableCell className="text-center">
                    <ModeBadge mode={batch.mode} />
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Lifecycle */}
                  {/* ---------------------------------- */}
                  <TableCell className="text-center">
                    <LifecycleBadge batch={batch} />
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Capacity */}
                  {/* ---------------------------------- */}
                  <TableCell className="text-center">
                    {batch.capacity ?? "Unlimited"}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Subjects */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    {batch.subjects?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {batch.subjects.length}
                          </Badge>
                        </TooltipTrigger>

                        <TooltipContent align="start">
                          <ul className="list-disc pl-4 space-y-1">
                            {batch.subjects.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Outcomes */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    {batch.learning_outcomes?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {batch.learning_outcomes.length}
                          </Badge>
                        </TooltipTrigger>

                        <TooltipContent align="start">
                          <ul className="list-disc pl-4 space-y-1">
                            {batch.learning_outcomes.map((o) => (
                              <li key={o}>{o}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Audience */}
                  {/* ---------------------------------- */}
                  <TableCell>
                    {batch.target_audience?.length ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">
                            {batch.target_audience.length}
                          </Badge>
                        </TooltipTrigger>

                        <TooltipContent align="start">
                          <ul className="list-disc pl-4 space-y-1">
                            {batch.target_audience.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Active */}
                  {/* ---------------------------------- */}
                  <TableCell className="text-center">
                    <BatchActiveSwitch
                      batchId={batch.id}
                      initialValue={batch.is_active}
                    />
                  </TableCell>

                  {/* ---------------------------------- */}
                  {/* Edit */}
                  {/* ---------------------------------- */}
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(batch)}
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
