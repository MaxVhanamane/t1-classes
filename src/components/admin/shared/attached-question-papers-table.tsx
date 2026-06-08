"use client";

import { Eye, FileText, Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import { Badge } from "@/src/components/ui/badge";

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
import { LoadingIndicator } from "../../ui/loading/loading-indicator";

type AttachedQuestionPapersTableProps = {
  items: QuestionPaper[];

  isLoading: boolean;

  onView: (questionPaper: QuestionPaper) => void;

  onRemove: (questionPaper: QuestionPaper) => void;
};

export function AttachedQuestionPapersTable({
  items,
  isLoading,
  onView,
  onRemove,
}: AttachedQuestionPapersTableProps) {
  if (isLoading) {
    return (
      <LoadingIndicator
        className="mt-8"
        message=" Loading attached question papers..."
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <FileText className="text-muted-foreground size-10" />

          <div>
            <h3 className="font-medium">No question papers attached</h3>

            <p className="text-muted-foreground mt-1 text-sm">
              Use the section below to attach question papers.
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
            <TableHead>Title</TableHead>

            <TableHead>Class</TableHead>

            <TableHead>Exam</TableHead>

            <TableHead>Subject</TableHead>

            <TableHead>Category</TableHead>

            <TableHead>Years</TableHead>

            <TableHead>Size</TableHead>

            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((paper) => (
            <TableRow key={paper.id}>
              <TableCell className="max-w-[320px]">
                <div className="truncate font-medium">{paper.title}</div>
              </TableCell>

              <TableCell>
                {paper.class_level ? `Class ${paper.class_level}` : "-"}
              </TableCell>

              <TableCell>
                {paper.target_exam
                  ? TARGET_EXAM_LABELS[paper.target_exam]
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

              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(paper)}
                    aria-label={`View ${paper.title}`}
                  >
                    <Eye className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onRemove(paper)}
                    aria-label={`Remove ${paper.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
