"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

import { getGridClasses } from "../helpers/grid-colors";
import GridBadge from "./grid-badge";

import { cn } from "@/src/lib/utils";
import { getQuestionCounts, MappedSection } from "../helpers/question-map";

type Props = {
  sections: MappedSection[];
  onJump: (questionId: string) => void;
  activeId: string;
};

export default function QuestionGrid({ sections, onJump, activeId }: Props) {
  const mapped = sections;

  const counts = getQuestionCounts(mapped);

  const totalQuestions = mapped.reduce(
    (acc, section) => acc + section.questions.length,
    0,
  );

  return (
    <Card className="relative rounded-md bg-muted-soft py-2">
      <CardContent className="p-0 py-3">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-3">
          <h3 className="text-sm font-semibold tracking-tight">
            Question Navigator
          </h3>

          <span className="inline-flex items-center rounded-full border border-border/50 bg-muted-soft px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
            <span className="font-semibold tabular-nums">{totalQuestions}</span>

            <span className="ml-1">Questions</span>
          </span>
        </div>

        {/* Legend */}
        <div className="mb-5 border-b border-border/60 px-3 pb-4">
          <div className="flex flex-wrap gap-2">
            <GridBadge state="answered" count={counts.answered} />

            <GridBadge state="not_visited" count={counts.not_visited} />

            <GridBadge state="not_answered" count={counts.not_answered} />

            <GridBadge state="review" count={counts.review} />

            <GridBadge state="answered_review" count={counts.answered_review} />
          </div>
        </div>

        {/* Question Grid */}
        <div className="space-y-6 px-3">
          {mapped.map((section) => (
            <div key={section.id} className="space-y-3">
              <div className="flex flex-col items-start justify-start">
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </div>
                </div>

                <div className="flex w-full items-center justify-between">
                  {section.subjectLabel && (
                    <div className="truncate text-sm tracking-tight text-muted-foreground">
                      {section.subjectLabel}
                    </div>
                  )}

                  <p className="shrink-0 rounded-md bg-transparent px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
                    <span className="font-semibold tabular-nums">
                      {section.questions.length}
                    </span>

                    <span className="ml-1">Qs</span>
                  </p>
                </div>
              </div>

              <div className="inline-grid grid-cols-5 place-items-center gap-2">
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
                        ? "after:absolute after:bottom-0.5 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-primary/80 before:absolute before:bottom-0.5 before:left-1/2 before:h-1.5 before:w-6 before:-translate-x-1/2 before:rounded-full before:bg-primary/20 before:blur-sm"
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
      </CardContent>
    </Card>
  );
}
