"use client";

import { Eye, FileText, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
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
} from "../../../batches/_features/zod-schema/schema";

import type { QuestionPaper } from "../types/question-paper";
import {
  formatCategory,
  formatFileSize,
  formatYears,
} from "../helper-functions/helpers";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

type QuestionPapersTableProps = {
  items: QuestionPaper[];

  isLoading: boolean;

  onEdit: (questionPaper: QuestionPaper) => void;

  onDelete: (questionPaper: QuestionPaper) => void;
  onView: (questionPaper: QuestionPaper) => void;
};

function truncateText(value: string, maxLength = 50) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

export function QuestionPapersTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: QuestionPapersTableProps) {
  if (isLoading) {
    return (
      <LoadingIndicator
        className="mt-16"
        message="Loading question papers..."
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <FileText className="text-muted-foreground size-10" />

          <div>
            <h3 className="font-medium">No question papers found</h3>

            <p className="text-muted-foreground mt-1 text-sm">
              Upload your first question paper or adjust the filters.
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
            <TableHead>Description</TableHead>
            <TableHead>Exam</TableHead>

            <TableHead>Subject</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Category</TableHead>

            <TableHead>Years</TableHead>

            <TableHead>Size</TableHead>

            <TableHead>Added On</TableHead>

            <TableHead className="w-30 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((paper) => (
            <TableRow key={paper.id}>
              <TableCell className="max-w-55">
                <div className="truncate font-medium">{paper.title}</div>
              </TableCell>

              <TableCell className="max-w-62.5">
                {paper.description ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-left font-normal"
                      >
                        {truncateText(paper.description)}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent align="start" className="max-w-sm">
                      <p className="text-sm whitespace-pre-wrap">
                        {paper.description}
                      </p>
                    </PopoverContent>
                  </Popover>
                ) : (
                  "-"
                )}
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
                {paper.class_level ? `Class ${paper.class_level}` : "-"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {formatCategory(paper.paper_category)}
                </Badge>
              </TableCell>

              <TableCell>{formatYears(paper.years)}</TableCell>

              <TableCell>{formatFileSize(paper.file_size)}</TableCell>

              <TableCell>
                {new Date(paper.created_at).toLocaleDateString()}
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    onClick={() => onView(paper)}
                    variant="ghost"
                    size="icon"
                  >
                    <Eye className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(paper)}
                  >
                    <Pencil className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(paper)}
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
