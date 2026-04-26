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

  const handleNavigate = (id: string) => {
    setActiveId(id);

    const key = ["attempt-state", attemptId];

    queryClient.setQueryData<StateItem[]>(key, (prev = []) => {
      const exists = prev.find((item) => item.questionId === id);

      // if already exists → update
      if (exists) {
        return prev.map((item) =>
          item.questionId === id ? { ...item, visited: true } : item,
        );
      }

      // if NOT exists → ADD it
      return [
        ...prev,
        {
          questionId: id,
          answer: null,
          visited: true,
          markedForReview: false,
        },
      ];
    });
  };
  return (
    <div className="flex h-[calc(100vh-109.6px)] flex-col min-[820px]:flex-row">
      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <QuestionWorkspace
          attemptId={attemptId}
          sections={sections}
          activeQuestionId={activeId}
          onNavigate={handleNavigate}
          state={state}
        />

        {/* MOBILE GRID */}
        <div className="min-[820px]:hidden">
          <QuestionGrid
            attemptId={attemptId}
            sections={sections}
            onJump={handleNavigate}
            activeId={activeId}
          />
        </div>
      </main>

      {/* SIDE GRID */}
      <aside className="hidden min-[820px]:block h-[calc(100vh-109.6px)] w-[320px] border-l bg-background">
        <div className="sticky top-0 h-full overflow-y-auto p-4">
          <QuestionGrid
            attemptId={attemptId}
            sections={sections}
            onJump={handleNavigate}
            activeId={activeId}
          />
        </div>
      </aside>
    </div>
  );
}
