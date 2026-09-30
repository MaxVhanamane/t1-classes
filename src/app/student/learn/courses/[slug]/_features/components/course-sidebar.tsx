"use client";

import { ChevronDown, LayoutList, ListTree } from "lucide-react";

import { Button } from "@/src/components/ui/button";
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
  // Intersect the base tree props with the viewMode props so TS knows they exist on treeProps
  treeProps: React.ComponentProps<typeof CourseStructureTree> & {
    viewMode: "nested" | "flat";
    onToggleViewMode: () => void;
  };
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
          {/* Header inside the scroll container for perfect width alignment */}
          <div className="relative flex-1 overflow-y-auto px-4 pb-4 pt-4 scrollbar-thin">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold">Course Content</h1>

              <Button
                variant="ghost"
                size="sm"
                onClick={treeProps.onToggleViewMode}
                className="flex h-8 items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {treeProps.viewMode === "nested" ? (
                  <>
                    <LayoutList className="h-4 w-4" />
                    Flat view
                  </>
                ) : (
                  <>
                    <ListTree className="h-4 w-4" />
                    Nested view
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </aside>
  );
}
