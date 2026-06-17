"use client";

import { Button } from "@/src/components/ui/button";
import { LifecycleBadge, ModeBadge } from "./batch-badges";
import { Pencil, ChevronDown } from "lucide-react";
import { BatchListItem } from "../types/types";
import { BatchActiveSwitch } from "./batch-active-switch";
import { Badge } from "@/src/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";

import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { TableThumbnailPreview } from "../../../courses/_features/components/Table-thumbnail-preview";
import { CATEGORY_LABELS, BOARD_LABELS } from "../zod-schema/schema";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { RichTextHTMLContent } from "../../../tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-html-content";
type Props = {
  batches: BatchListItem[];
  onEdit: (batch: BatchListItem) => void;
};

export function BatchesCards({ batches, onEdit }: Props) {
  return (
    <div className="md:hidden space-y-4">
      {batches.map((batch) => {
        const thumbnailSrc = batch.thumbnail_image
          ? `${R2_BUCKET_PUBLIC_URL}/${batch.thumbnail_image}`
          : null;

        return (
          <div key={batch.id} className="border rounded-lg p-4 space-y-4">
            {/* ---------------------------------- */}
            {/* HEADER */}
            {/* ---------------------------------- */}
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div className="w-16 h-16 shrink-0">
                <TableThumbnailPreview src={thumbnailSrc} title={batch.title} />
              </div>

              {/* Title */}
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-base leading-tight">
                  {batch.title}
                </h3>

                {batch.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {batch.subtitle}
                  </p>
                )}

                {/* ---------------------------------- */}
                {/* Category + Board */}
                {/* ---------------------------------- */}
                <div className="flex flex-wrap gap-2">
                  {/* Category */}
                  <Badge variant="outline">
                    {CATEGORY_LABELS[batch.category] ?? batch.category}
                  </Badge>

                  {/* Board */}
                  {batch.category === "boards" && batch.board && (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="cursor-help">
                          {batch.board.toUpperCase()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {BOARD_LABELS[batch.board]}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Courses */}
                {batch.courses.length === 0 ? (
                  <p className="text-sm text-destructive font-medium">
                    No courses linked
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {batch.courses.length === 1
                      ? `Course: ${batch.courses[0].course.title}`
                      : `Courses: ${batch.courses
                          .map((c) => c.course.title)
                          .join(", ")}`}
                  </p>
                )}
              </div>

              {/* Edit */}
              <Button size="icon" variant="ghost" onClick={() => onEdit(batch)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            {/* ---------------------------------- */}
            {/* Description (TipTap) */}
            {/* ---------------------------------- */}
            {batch.description && (
              <div className="text-sm">
                <RichTextHTMLContent content={batch.description} clamp />
              </div>
            )}

            {/* ---------------------------------- */}
            {/* Price */}
            {/* ---------------------------------- */}
            <div className="flex flex-col gap-1 text-sm">
              {batch.list_price > batch.sale_price && (
                <span className="text-xs line-through text-muted-foreground">
                  ₹{batch.list_price.toLocaleString("en-IN")}
                </span>
              )}

              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">
                  ₹{batch.sale_price.toLocaleString("en-IN")}
                </span>

                {batch.list_price > batch.sale_price && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(
                      ((batch.list_price - batch.sale_price) /
                        batch.list_price) *
                        100,
                    )}
                    % OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* ---------------------------------- */}
            {/* Admission */}
            {/* ---------------------------------- */}
            <Badge
              variant={batch.is_admission_open ? "outline" : "secondary"}
              className="w-fit"
            >
              {batch.is_admission_open ? "Admission Open" : "Admission Closed"}
            </Badge>

            {/* ---------------------------------- */}
            {/* Mode + Lifecycle */}
            {/* ---------------------------------- */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Mode:</span>
                <ModeBadge mode={batch.mode} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Lifecycle:</span>
                <LifecycleBadge batch={batch} />
              </div>
            </div>

            {/* ---------------------------------- */}
            {/* Dates */}
            {/* ---------------------------------- */}
            <div className="text-sm">
              <span className="text-muted-foreground">Dates:</span>{" "}
              {new Date(batch.start_date).toLocaleDateString()} –{" "}
              {new Date(batch.end_date).toLocaleDateString()}
            </div>

            {/* ---------------------------------- */}
            {/* Location */}
            {/* ---------------------------------- */}
            <div className="text-sm">
              <span className="text-muted-foreground">Location:</span>{" "}
              {batch.location ?? "—"}
            </div>
            {/* Address */}
            {batch.address && (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground truncate cursor-help max-w-55">
                    {batch.address}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {batch.address}
                </TooltipContent>
              </Tooltip>
            )}

            {/* ---------------------------------- */}
            {/* Languages */}
            {/* ---------------------------------- */}
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Languages:</span>

              <div className="flex flex-wrap gap-1">
                {batch.languages.length > 0 ? (
                  batch.languages.map((lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="capitalize"
                    >
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm">—</span>
                )}
              </div>
            </div>

            {/* ---------------------------------- */}
            {/* Subjects */}
            {/* ---------------------------------- */}
            {batch.subjects?.length ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-primary flex items-center gap-1"
                  >
                    Subjects
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2">
                  <ul className="list-disc pl-4 text-sm space-y-1">
                    {batch.subjects.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : null}

            {/* ---------------------------------- */}
            {/* Learning Outcomes */}
            {/* ---------------------------------- */}
            {batch.learning_outcomes?.length ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-primary flex items-center gap-1"
                  >
                    Learning Outcomes
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2">
                  <ul className="list-disc pl-4 text-sm space-y-1">
                    {batch.learning_outcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : null}

            {/* ---------------------------------- */}
            {/* Target Audience */}
            {/* ---------------------------------- */}
            {batch.target_audience?.length ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-primary flex items-center gap-1"
                  >
                    Target Audience
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2">
                  <ul className="list-disc pl-4 text-sm space-y-1">
                    {batch.target_audience.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : null}

            {/* ---------------------------------- */}
            {/* Footer */}
            {/* ---------------------------------- */}
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <span>Capacity: {batch.capacity ?? "Unlimited"}</span>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Active</span>

                <BatchActiveSwitch
                  batchId={batch.id}
                  initialValue={batch.is_active}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
