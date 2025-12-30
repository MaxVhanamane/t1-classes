"use client";

import { ChapterItem } from "../chapter/chapter-item";
import { AddChapterDialog } from "../chapter/add-chapter-dialog";
import { Chapter } from "../../types/course-structure.ui.types";

type StructureTreeProps = {
  courseId: string;
  chapters: Chapter[];
};

export function StructureTree({ courseId, chapters }: StructureTreeProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Course Structure</h2>
        <AddChapterDialog courseId={courseId} />
      </div>

      {/* Empty state */}
      {chapters.length === 0 && (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No chapters added yet.
        </div>
      )}

      {/* Chapters */}
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <ChapterItem key={chapter.id} chapter={chapter} courseId={courseId} />
        ))}
      </div>
    </div>
  );
}
