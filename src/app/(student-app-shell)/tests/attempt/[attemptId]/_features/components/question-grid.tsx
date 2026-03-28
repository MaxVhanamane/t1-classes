"use client";

import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

import { getGridClasses } from "../helpers/grid-colors";
import GridBadge from "./grid-badge";
// import { useSyncStatus } from "../hooks/use-sync-status";
// import SyncDot from "./sync-dot";

import { GridState } from "../types/grid.types";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { useAttemptState } from "../hooks/use-attempt-state";
import { cn } from "@/src/lib/utils";

type Props = {
  attemptId: string;
  sections: Section[];
  onJump: (questionId: string) => void;
  activeId: string;
};

export default function QuestionGrid({
  attemptId,
  sections,
  onJump,
  activeId,
}: Props) {
  const { state } = useAttemptState(attemptId, []);
  // const sync = useSyncStatus(attemptId);

  // ----------------------------------
  // Build grid from cache
  // ----------------------------------
  const mapped = sections.map((section) => {
    let counter = 1;

    return {
      sectionId: section.id,
      title: section.title,
      questions: section.questions.map((q) => {
        const item = state.find((s) => s.questionId === q.id);

        let gridState: GridState = "not_visited";

        if (item) {
          if (item.markedForReview && item.answer) {
            gridState = "answered_review";
          } else if (item.markedForReview) {
            gridState = "review";
          } else if (item.answer) {
            gridState = "answered";
          } else if (item.visited) {
            gridState = "not_answered";
          }
        }

        return {
          id: q.id,
          index: counter++,
          state: gridState,
        };
      }),
    };
  });

  return (
    <Card className="relative py-2">
      <CardContent className="p-0 py-3">
        {/* Sync Indicator */}
        {/* <div className="absolute right-4 top-2">
          <SyncDot status={sync} />
        </div> */}

        <h3 className="mb-3 text-sm font-semibold px-3 text-center lg:text-left">
          Question Navigator
        </h3>

        <ScrollArea className="h-[60vh] pt-2">
          <div className="space-y-4 px-3 flex justify-center">
            {mapped.map((section) => (
              <div key={section.sectionId} className="space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  {section.title}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {section.questions.map((q) => (
                    <Button
                      key={q.id}
                      size="sm"
                      variant="ghost"
                      onClick={() => onJump(q.id)}
                      className={cn(
                        "relative h-13 w-13 lg:h-10 lg:w-10 p-0 font-medium",
                        getGridClasses(q.state),
                        q.id === activeId
                          ? `
    after:absolute after:bottom-0.75 after:left-1/2 after:-translate-x-1/2
    after:h-0.5 after:w-4 after:rounded-full after:bg-primary/80

    before:absolute before:bottom-0.5 before:left-1/2 before:-translate-x-1/2
    before:h-1.5 before:w-6 before:rounded-full before:bg-primary/20 before:blur-sm
  `
                          : "",
                      )}
                    >
                      {q.index}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-1 px-3">
          <GridBadge state="not_visited" />
          <GridBadge state="answered" />
          <GridBadge state="not_answered" />
          <GridBadge state="review" />
          <GridBadge state="answered_review" />
        </div>
      </CardContent>
    </Card>
  );
}
