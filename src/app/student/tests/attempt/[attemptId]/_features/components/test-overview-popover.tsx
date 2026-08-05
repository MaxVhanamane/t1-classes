"use client";

import { useMemo } from "react";
import { Info, Layers } from "lucide-react";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { CachedTestPayload } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { Button } from "@/src/components/ui/button";

type Props = {
  testPayload: CachedTestPayload;
};

export function TestOverviewPopover({ testPayload }: Props) {
  // Group sections strictly by subjectLabel
  const groupedSubjects = useMemo(() => {
    return testPayload.sections.reduce(
      (acc, section) => {
        const subject = section.subjectLabel;

        let group = acc.find((g) => g.subject === subject);
        if (!group) {
          group = { subject, questions: 0, marks: 0, sectionsCount: 0 };
          acc.push(group);
        }

        group.questions += section.sectionTotalQuestions;
        group.marks += Number(section.sectionTotalMarks);
        group.sectionsCount += 1;

        return acc;
      },
      [] as {
        subject: string;
        questions: number;
        marks: number;
        sectionsCount: number;
      }[],
    );
  }, [testPayload]);

  return (
    <RichPopover
      color="indigo"
      badgeText="Overview"
      metaText={`${testPayload.totalMarks} Marks`}
      title="Exam Structure"
      icon={<Layers className="h-4 w-4" />}
      description="Global metrics and subject-wise breakdown."
      sideOffset={8}
      collisionPadding={16}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full bg-muted/80 text-muted-foreground transition-all hover:bg-muted-foreground/20 hover:text-foreground"
          aria-label="Test Overview"
        >
          <Info className="h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Global Stats Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-2.5 text-center border border-border/40">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Questions
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {testPayload.totalQuestions}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-border/40 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sections
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {testPayload.totalSections}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Marks
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {testPayload.totalMarks}
            </span>
          </div>
        </div>

        {/* Subject-Wise Breakdown */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Subject Breakdown
          </p>

          <ScrollArea className="max-h-38 pr-3 -mr-3 [&>[data-radix-scroll-area-viewport]]:max-h-[inherit]">
            <div className="space-y-2.5 divide-y divide-border/30">
              {groupedSubjects.map((sub) => (
                <div key={sub.subject} className="pt-2.5 first:pt-0 space-y-1">
                  <div className="text-xs font-bold text-foreground">
                    {sub.subject}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>
                      {sub.sectionsCount}{" "}
                      {sub.sectionsCount === 1 ? "Section" : "Sections"}
                    </span>
                    <span>•</span>
                    <span>{sub.questions} Questions</span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {sub.marks} Marks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </RichPopover>
  );
}
