"use client";

import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";

import { cn } from "@/src/lib/utils";

import { CourseStructureTree } from "./course-structure-tree";
import { CourseQuestionPapersSection } from "./question-papers/course-question-papers-section";

type Props = {
  mode: "learn" | "preview";

  courseId: string;

  treeProps: React.ComponentProps<typeof CourseStructureTree>;
};

export function CourseSidebar({ mode, courseId, treeProps }: Props) {
  return (
    <aside
      className={cn(
        "hidden lg:block",
        mode === "preview" && "w-full shrink-0 lg:w-95",
      )}
    >
      <div
        className={cn(
          "bg-background",
          mode === "learn" && "fixed top-14 right-7 h-screen w-md",
          mode === "preview" &&
            "relative h-150 overflow-hidden rounded-xl border",
        )}
      >
        <div
          className={cn(
            "flex flex-col",
            mode === "learn" && "h-[calc(100vh-56px)]",
            mode === "preview" && "h-full",
          )}
        >
          <h1 className="shrink-0 px-4 py-3 text-lg font-semibold">
            Course Content
          </h1>

          <div className="relative flex-1 overflow-y-auto px-4 pb-4 pt-1">
            <div className="space-y-6">
              <Collapsible defaultOpen>
                <div className="overflow-hidden rounded-sm border border-border">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">
                        Course Structure
                      </h3>

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
          </div>
        </div>
      </div>
    </aside>
  );
}
