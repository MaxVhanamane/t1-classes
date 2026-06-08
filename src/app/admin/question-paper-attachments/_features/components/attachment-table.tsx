"use client";

import { FileText, Loader } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { TARGET_EXAM_LABELS } from "../../../batches/_features/zod-schema/schema";
import { Link } from "@/src/components/ui/link";
import { AttachmentTarget } from "../types/attachment-target";

type AttachmentTableProps = {
  items: AttachmentTarget[];

  isLoading: boolean;

  type: "batches" | "courses";
};

export function AttachmentTable({
  items,
  isLoading,
  type,
}: AttachmentTableProps) {
  if (isLoading) {
    return (
      <div>
        <div className="text-muted-foreground p-8 text-center text-sm">
          <Loader className="mx-auto mb-2 animate-spin" />
          Loading...
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
            <h3 className="font-medium">No results found</h3>

            <p className="text-muted-foreground mt-1 text-sm">
              Try adjusting your filters.
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

            <TableHead>Target Exam</TableHead>

            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>

              <TableCell>
                {item.class_level ? `Class ${item.class_level}` : "-"}
              </TableCell>

              <TableCell>
                {item.target_exam
                  ? TARGET_EXAM_LABELS[
                      item.target_exam as keyof typeof TARGET_EXAM_LABELS
                    ]
                  : "-"}
              </TableCell>

              <TableCell>
                <div className="flex justify-end">
                  <Button asChild size="sm">
                    <Link
                      href={
                        type === "batches"
                          ? `/admin/question-paper-batch-attachments/${item.id}`
                          : `/admin/question-paper-course-attachments/${item.id}`
                      }
                    >
                      Manage Papers
                    </Link>
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
