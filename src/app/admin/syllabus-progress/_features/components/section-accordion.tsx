"use client";

import { Pencil, Plus, FolderDown } from "lucide-react";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";

import type {
  SyllabusSectionRow,
  SyllabusChapterRow,
} from "../types/syllabus-progress.types";
import { ChapterRowItem } from "./chapter-row-item";

interface SectionAccordionProps {
  section: SyllabusSectionRow;
  isAdmin: boolean;
  onEditSectionTitle: (section: SyllabusSectionRow) => void;
  onEditChapterTitle: (chapter: SyllabusChapterRow) => void;
  onAddChapter: (sectionId: string) => void;
  onImportCourse: (sectionId: string) => void;
  onRefresh: () => void;
}

export function SectionAccordion({
  section,
  isAdmin,
  onEditSectionTitle,
  onEditChapterTitle,
  onAddChapter,
  onImportCourse,
  onRefresh,
}: SectionAccordionProps) {
  const chapters = section.chapters ?? [];
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(
    (c) => c.status === "completed",
  ).length;
  const progressPercent =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  return (
    <AccordionItem
      value={section.id}
      className="border rounded-xl bg-card mb-4 shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-accent/30 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 pr-2 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-foreground tracking-tight">
              {section.title}
            </span>

            {isAdmin && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground shrink-0 relative z-10 cursor-pointer"
                title="Edit section title"
              >
                {/* 
                  Using a span here instead of a button prevents the HTML validation error 
                  of having a <button> nested inside the AccordionTrigger's <button>.
                */}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditSectionTitle(section);
                  }}
                >
                  <Pencil className="size-3.5" />
                </span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground shrink-0">
            <span>
              {completedChapters}/{totalChapters} Chapters ({progressPercent}%)
            </span>
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-5 pb-5 pt-2">
        {/* Admin Action Bar Inside Section */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/40 rounded-lg border border-border/50">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddChapter(section.id)}
              className="gap-1.5 h-8 bg-background"
            >
              <Plus className="size-3.5" />
              Add Custom Chapter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onImportCourse(section.id)}
              className="gap-1.5 h-8 bg-background"
            >
              <FolderDown className="size-3.5" />
              Import from Course
            </Button>
          </div>
        )}

        {chapters.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border/60 rounded-lg bg-background/50">
            This section is empty. Add chapters or import a course.
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <ChapterRowItem
                key={chapter.id}
                chapter={chapter}
                isAdmin={isAdmin}
                onEditTitle={onEditChapterTitle}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
