"use client";

import { useQuery } from "@tanstack/react-query";

import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

import { fetchGrid } from "../api/grid";
import { mapGridToSections } from "../helpers/map-grid";
import { getGridClasses } from "../helpers/grid-colors";

import GridBadge from "./grid-badge";
import { useSyncStatus } from "../hooks/use-sync-status";
import SyncDot from "./sync-dot";

type Props = {
  attemptId: string;
  sections: { id: string; title: string }[];
  onJump: (questionId: string) => void;
};

export default function QuestionGrid({ attemptId, sections, onJump }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["grid", attemptId],
    queryFn: () => fetchGrid(attemptId),

    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
  });

  const sync = useSyncStatus(attemptId);
  const mapped = data ? mapGridToSections(data, sections) : [];

  return (
    <Card className="relative">
      <CardContent className="p-3">
        {/* Sync Indicator */}
        <div className="absolute right-4 top-2">
          <SyncDot status={sync} />
        </div>

        <h3 className="mb-3 text-sm font-semibold">Question Navigator</h3>

        <ScrollArea className="h-[60vh] pr-2">
          <div className="space-y-4">
            {isLoading && (
              <p className="text-xs text-muted-foreground">Loading grid...</p>
            )}

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
                      className={`relative h-10 w-10 p-0 font-medium ${getGridClasses(
                        q.state,
                      )}`}
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
        <div className="mt-4 flex flex-wrap gap-1">
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
