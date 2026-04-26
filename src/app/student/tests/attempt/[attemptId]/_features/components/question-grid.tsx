"use client";

import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

import { getGridClasses } from "../helpers/grid-colors";
import GridBadge from "./grid-badge";

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

  let counter = 1;

  const mapped = sections.map((section) => ({
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
  }));

  const counts = {
    not_visited: 0,
    answered: 0,
    not_answered: 0,
    review: 0,
    answered_review: 0,
  };

  mapped.forEach((section) => {
    section.questions.forEach((q) => {
      counts[q.state]++;
    });
  });

  return (
    <Card className="relative py-2">
      <CardContent className="p-0 py-3">
        <h3 className="mb-3 px-3 text-center text-sm font-semibold lg:text-left">
          Question Navigator
        </h3>

        <ScrollArea className="max-h-105 min-[820px]:max-h-[calc(100vh-320px)]">
          <div className="space-y-5 px-3">
            {mapped.map((section) => (
              <div key={section.sectionId} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </div>

                {/* KEY FIX: inline-grid + fixed columns + left aligned */}
                <div className="inline-grid grid-cols-5 gap-2 place-items-center">
                  {section.questions.map((q) => (
                    <Button
                      key={q.id}
                      size="sm"
                      variant="ghost"
                      onClick={() => onJump(q.id)}
                      className={cn(
                        "relative h-10 w-10 shrink-0 p-0 text-sm font-medium md:h-11 md:w-11 lg:h-10 lg:w-10",
                        getGridClasses(q.state),
                        q.id === activeId
                          ? `
after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2
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
        <div className="mt-4 px-3">
          <div className="flex flex-wrap gap-2">
            <GridBadge state="answered" count={counts.answered} />
            <GridBadge state="not_visited" count={counts.not_visited} />
            <GridBadge state="not_answered" count={counts.not_answered} />
            <GridBadge state="review" count={counts.review} />
            <GridBadge state="answered_review" count={counts.answered_review} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
