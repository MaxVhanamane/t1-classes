"use client";

import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";

import { CourseStructureTree } from "./course-structure-tree";
import { CourseQuestionPapersSection } from "./question-papers/course-question-papers-section";

type Props = {
  courseId: string;

  treeProps: React.ComponentProps<typeof CourseStructureTree>;
};

export function CourseMobileContent({ courseId, treeProps }: Props) {
  return (
    <div className="space-y-4">
      <Collapsible defaultOpen>
        <div className="overflow-hidden rounded-sm border border-border">
          <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Curriculum</h3>

              <p className="text-xs text-muted-foreground">
                Browse chapters, topics, and learning materials.
              </p>
            </div>

            <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent className="border-t">
            <CourseStructureTree {...treeProps} />
          </CollapsibleContent>
        </div>
      </Collapsible>

      <CourseQuestionPapersSection courseId={courseId} />
    </div>
  );
}
