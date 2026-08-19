"use client";

import { ArrowRight, FolderTree, Pencil, Trash2 } from "lucide-react";

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
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

import {
  SUBJECT_LABELS,
  TARGET_EXAM_LABELS,
} from "@/src/app/admin/batches/_features/zod-schema/schema";
import { HomeworkChapter } from "../../[chapterId]/_features/types/homework";
import { Link } from "@/src/components/ui/link";

type HomeworkChaptersTableProps = {
  items: HomeworkChapter[];
  isLoading: boolean;
  onEdit: (chapter: HomeworkChapter) => void;
  onDelete: (chapter: HomeworkChapter) => void;
};

export function HomeworkChaptersTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: HomeworkChaptersTableProps) {
  if (isLoading) {
    return <LoadingIndicator className="mt-16" message="Loading chapters..." />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <FolderTree className="text-muted-foreground size-10" />
          <div>
            <h3 className="font-medium">No chapters found</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Create a chapter structure before uploading homework materials.
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
            <TableHead>Chapter Name</TableHead>
            <TableHead>No.</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Exam</TableHead>
            <TableHead>Added On</TableHead>
            {/* Widened the actions column to fit the new button */}
            <TableHead className="w-48 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((chapter) => (
            <TableRow key={chapter.id}>
              <TableCell className="font-medium">
                {chapter.chapter_name}
              </TableCell>

              <TableCell>
                {chapter.chapter_number ? (
                  <Badge variant="secondary">Ch {chapter.chapter_number}</Badge>
                ) : (
                  "-"
                )}
              </TableCell>

              <TableCell>{SUBJECT_LABELS[chapter.subject]}</TableCell>

              <TableCell>
                {chapter.class_level ? `Class ${chapter.class_level}` : "-"}
              </TableCell>

              <TableCell>
                {chapter.target_exam
                  ? TARGET_EXAM_LABELS[chapter.target_exam]
                  : "-"}
              </TableCell>

              <TableCell>
                {new Date(chapter.created_at).toLocaleDateString()}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {/* The new Manage Materials Button linking to the dynamic route */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/homework/${chapter.id}`}>
                      Materials <ArrowRight className="ml-2 size-3" />
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(chapter)}
                  >
                    <Pencil className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(chapter)}
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
