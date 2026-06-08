"use client";

import { FileText } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import {
  SUBJECT_LABELS,
  TARGET_EXAM_LABELS,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

import type { QuestionPaper } from "@/src/app/admin/question-papers/_features/types/question-paper";

import {
  formatCategory,
  formatFileSize,
  formatYears,
} from "@/src/app/admin/question-papers/_features/helper-functions/helpers";

type AvailableQuestionPapersTableProps = {
  items: QuestionPaper[];

  isLoading: boolean;

  selectedIds: string[];

  onSelectionChange: (selectedIds: string[]) => void;
};

export function AvailableQuestionPapersTable({
  items,
  isLoading,
  selectedIds,
  onSelectionChange,
}: AvailableQuestionPapersTableProps) {
  const allSelected =
    items.length > 0 && items.every((paper) => selectedIds.includes(paper.id));

  function handleSelectAll(checked: boolean) {
    if (checked) {
      const next = Array.from(
        new Set([...selectedIds, ...items.map((paper) => paper.id)]),
      );

      onSelectionChange(next);

      return;
    }

    onSelectionChange(
      selectedIds.filter((id) => !items.some((paper) => paper.id === id)),
    );
  }

  function handleToggle(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));

      return;
    }

    onSelectionChange([...selectedIds, id]);
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <div className="text-muted-foreground p-8 text-center text-sm">
          Loading available question papers...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <FileText className="text-muted-foreground size-10" />

          <div>
            <h3 className="font-medium">No matching question papers found</h3>

            <p className="text-muted-foreground mt-1 text-sm">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                aria-label="Select all question papers on this page"
              />
            </TableHead>

            <TableHead>Title</TableHead>

            <TableHead>Class</TableHead>

            <TableHead>Exam</TableHead>

            <TableHead>Subject</TableHead>

            <TableHead>Category</TableHead>

            <TableHead>Years</TableHead>

            <TableHead>Size</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((paper) => {
            const isSelected = selectedIds.includes(paper.id);

            return (
              <TableRow key={paper.id}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(paper.id)}
                    aria-label={`Select ${paper.title}`}
                  />
                </TableCell>

                <TableCell className="max-w-[320px]">
                  <div className="truncate font-medium">{paper.title}</div>
                </TableCell>

                <TableCell>
                  {paper.class_level ? `Class ${paper.class_level}` : "-"}
                </TableCell>

                <TableCell>
                  {paper.target_exam
                    ? TARGET_EXAM_LABELS[
                        paper.target_exam as keyof typeof TARGET_EXAM_LABELS
                      ]
                    : "-"}
                </TableCell>

                <TableCell>
                  {paper.subject ? SUBJECT_LABELS[paper.subject] : "-"}
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {formatCategory(paper.paper_category)}
                  </Badge>
                </TableCell>

                <TableCell>{formatYears(paper.years)}</TableCell>

                <TableCell>{formatFileSize(paper.file_size)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="border-t p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground text-sm">
            Selected:{" "}
            <span className="font-medium text-foreground">
              {selectedIds.length}
            </span>
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.length === 0}
            onClick={() => onSelectionChange([])}
          >
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
