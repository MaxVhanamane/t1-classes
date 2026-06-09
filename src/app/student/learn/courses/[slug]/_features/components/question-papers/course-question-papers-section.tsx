"use client";

import { useState } from "react";

import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";

import { cn } from "@/src/lib/utils";

import CourseQuestionPapersPanel from "./course-question-papers-panel";

type Props = {
  courseId: string;
};

export function CourseQuestionPapersSection({ courseId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Question Papers</h3>

            <p className="text-xs text-muted-foreground">
              Previous year papers and practice sets
            </p>
          </div>

          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-4 min-h-96">
            <CourseQuestionPapersPanel courseId={courseId} enabled={open} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
