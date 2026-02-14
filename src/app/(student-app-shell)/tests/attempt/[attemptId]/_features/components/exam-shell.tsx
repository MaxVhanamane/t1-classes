"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import QuestionGrid from "./question-grid";
import QuestionWorkspace from "./question-workspace";
import { StateItem } from "../types/workspace.types";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";

type Props = {
  attemptId: string;
  sections: Section[];
  state: StateItem[];
};

export default function ExamShell({ attemptId, sections, state }: Props) {
  const queryClient = useQueryClient();

  // ----------------------------------
  // Hydrate cache ONCE from server
  // ----------------------------------
  useEffect(() => {
    const key = ["attempt-state", attemptId];

    const existing = queryClient.getQueryData<StateItem[]>(key);

    // Only seed cache ONCE (first load)
    if (!existing) {
      queryClient.setQueryData<StateItem[]>(key, state);
    }
  }, [attemptId, state, queryClient]);

  const flat = useMemo(() => {
    return sections.flatMap((s) =>
      s.questions.map((q) => ({
        id: q.id,
        sectionId: s.id,
      })),
    );
  }, [sections]);

  const [activeId, setActiveId] = useState(flat[0]?.id);

  return (
    <div className="flex h-[calc(100vh-109.6px)] flex-col lg:flex-row">
      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <QuestionWorkspace
          attemptId={attemptId}
          sections={sections}
          activeQuestionId={activeId}
          onNavigate={setActiveId}
          state={state}
        />

        {/* MOBILE GRID */}
        <div className="lg:hidden">
          <QuestionGrid
            attemptId={attemptId}
            sections={sections.map((s) => ({
              id: s.id,
              title: s.title,
            }))}
            onJump={setActiveId}
          />
        </div>
      </main>

      {/* DESKTOP GRID */}
      <aside className="hidden h-[calc(100vh-109.6px)] w-80 border-l bg-background lg:block">
        <div className="sticky top-0 h-full overflow-y-auto p-4">
          <QuestionGrid
            attemptId={attemptId}
            sections={sections.map((s) => ({
              id: s.id,
              title: s.title,
            }))}
            onJump={setActiveId}
          />
        </div>
      </aside>
    </div>
  );
}
